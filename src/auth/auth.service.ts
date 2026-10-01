import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Resend } from 'resend';

@Injectable()
export class AuthService {
  private resend: Resend | null;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

const valid = await (bcrypt as any).compare(password, user.password);
if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async forgotPassword(email: string) {
    // Mensaje genérico siempre, exista o no el usuario: así no se puede usar
    // este endpoint para averiguar qué emails están registrados.
    const genericResponse = {
      message:
        'Si el email está registrado, te enviamos un link para restablecer tu contraseña.',
    };

    const user = await this.usersService.findByEmail(email);
    if (!user) return genericResponse;

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hora
    await this.usersService.setResetToken(user.id, token, expires);

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ??
      'https://volquetes-empresa-7asq.vercel.app';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    if (this.resend) {
      const from =
        this.configService.get<string>('RESEND_FROM') ??
        'Bilny <onboarding@resend.dev>';

      await this.resend.emails.send({
        from,
        to: user.email,
        subject: 'Recuperá tu contraseña — Bilny',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #0f172a;">
            <h2 style="margin-bottom: 4px;">Bilny</h2>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
            <p style="margin: 24px 0;">
              <a href="${resetLink}" style="background:#f59e0b;color:#0f172a;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;">
                Restablecer contraseña
              </a>
            </p>
            <p style="color:#64748b;font-size:13px;">
              Si vos no pediste esto, podés ignorar este email. El link vence en 1 hora.
            </p>
          </div>
        `,
      });
    }

    return genericResponse;
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword || newPassword.length < 8) {
      throw new BadRequestException(
        'Faltan datos o la contraseña es muy corta (mínimo 8 caracteres).',
      );
    }

    const user = await this.usersService.findByResetToken(token);
    if (
      !user ||
      !user.reset_password_expires ||
      user.reset_password_expires.getTime() < Date.now()
    ) {
      throw new BadRequestException(
        'El link es inválido o expiró. Pedí uno nuevo.',
      );
    }

    await this.usersService.updatePassword(user.id, newPassword);
    return { message: 'Contraseña actualizada correctamente.' };
  }
}
