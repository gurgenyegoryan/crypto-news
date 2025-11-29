"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const email_service_1 = require("../email/email.service");
const crypto_1 = require("crypto");
const otplib_1 = require("otplib");
const qrcode_1 = require("qrcode");
let AuthService = class AuthService {
    usersService;
    jwtService;
    emailService;
    constructor(usersService, jwtService, emailService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }
    async validateUser(email, pass) {
        const user = await this.usersService.findOne(email);
        if (user && user.password && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async getUserById(id) {
        return this.usersService.findById(id);
    }
    async login(user, twoFactorCode) {
        if (user.isTwoFactorEnabled && !twoFactorCode) {
            return {
                requiresTwoFactor: true,
                userId: user.id,
                email: user.email,
            };
        }
        if (user.isTwoFactorEnabled && twoFactorCode) {
            const isValid = await this.verify2FACode(user.id, twoFactorCode);
            if (!isValid) {
                throw new common_1.UnauthorizedException('Invalid 2FA code');
            }
        }
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isVerified: user.isVerified,
                isTwoFactorEnabled: user.isTwoFactorEnabled,
            }
        };
    }
    async signup(email, pass, name) {
        const existingUser = await this.usersService.findOne(email);
        if (existingUser) {
            throw new common_1.BadRequestException('User already exists');
        }
        const hashedPassword = await bcrypt.hash(pass, 10);
        const verificationToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const user = await this.usersService.create({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiry,
            isVerified: false,
        });
        await this.emailService.sendVerificationEmail(email, verificationToken);
        return this.login(user);
    }
    async verifyEmail(token) {
        const user = await this.usersService.findByVerificationToken(token);
        if (!user) {
            throw new common_1.BadRequestException('Invalid verification token');
        }
        if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
            throw new common_1.BadRequestException('Verification token expired');
        }
        if (user.isVerified) {
            return { message: 'Email already verified' };
        }
        await this.usersService.update(user.id, {
            isVerified: true,
            verificationToken: null,
            verificationTokenExpiry: null,
        });
        return { message: 'Email verified successfully' };
    }
    async resendVerification(user) {
        if (user.isVerified) {
            throw new common_1.BadRequestException('Email already verified');
        }
        const verificationToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.usersService.update(user.id, {
            verificationToken,
            verificationTokenExpiry,
        });
        await this.emailService.sendVerificationEmail(user.email, verificationToken);
        return { message: 'Verification email sent' };
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.password || !(await bcrypt.compare(currentPassword, user.password))) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.usersService.update(userId, {
            password: hashedPassword,
        });
        return { message: 'Password changed successfully' };
    }
    async generate2FASecret(userId) {
        const user = await this.usersService.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const secret = otplib_1.authenticator.generateSecret();
        const otpauthUrl = otplib_1.authenticator.keyuri(user.email, 'CryptoMonitor', secret);
        await this.usersService.update(userId, {
            twoFactorSecret: secret,
        });
        const qrCodeUrl = await (0, qrcode_1.toDataURL)(otpauthUrl);
        return {
            secret,
            qrCodeUrl,
        };
    }
    async enable2FA(userId, code) {
        const user = await this.usersService.findById(userId);
        if (!user || !user.twoFactorSecret) {
            throw new common_1.BadRequestException('2FA setup not initiated');
        }
        const isValid = otplib_1.authenticator.verify({
            token: code,
            secret: user.twoFactorSecret,
        });
        if (!isValid) {
            throw new common_1.BadRequestException('Invalid 2FA code');
        }
        await this.usersService.update(userId, {
            isTwoFactorEnabled: true,
        });
        return { message: '2FA enabled successfully' };
    }
    async disable2FA(userId, code) {
        const user = await this.usersService.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (!user.isTwoFactorEnabled) {
            throw new common_1.BadRequestException('2FA is not enabled');
        }
        if (!user.twoFactorSecret) {
            throw new common_1.BadRequestException('2FA secret not found');
        }
        const isValid = otplib_1.authenticator.verify({
            token: code,
            secret: user.twoFactorSecret,
        });
        if (!isValid) {
            throw new common_1.BadRequestException('Invalid 2FA code');
        }
        await this.usersService.update(userId, {
            isTwoFactorEnabled: false,
            twoFactorSecret: null,
        });
        return { message: '2FA disabled successfully' };
    }
    async verify2FACode(userId, code) {
        const user = await this.usersService.findById(userId);
        if (!user || !user.twoFactorSecret)
            return false;
        return otplib_1.authenticator.verify({
            token: code,
            secret: user.twoFactorSecret,
        });
    }
    async updateProfile(userId, name, email) {
        if (email) {
            const existingUser = await this.usersService.findOne(email);
            if (existingUser && existingUser.id !== userId) {
                throw new Error('Email is already in use');
            }
        }
        const user = await this.usersService.update(userId, {
            name,
            email,
        });
        const { password, verificationToken, verificationTokenExpiry, twoFactorSecret, ...result } = user;
        return result;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map