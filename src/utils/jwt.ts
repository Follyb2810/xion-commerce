import { sign, verify, Secret, SignOptions } from "jsonwebtoken";

interface JwtPayload {
    id: string;
    // email: string;
    roles: string[];
}

class JwtService {
    private static secret: Secret | null = null;

    private constructor() {}

    private static getSecret(): Secret {
        if (!this.secret) {
            this.secret = process.env.JWT_SECRET!;
            if (!this.secret) {
                throw new Error("JWT_SECRET is not defined. Make sure it is set in the environment variables.");
            }
        }
        return this.secret;
    }

    static signToken(payload: Record<string, any>, expiresIn: SignOptions["expiresIn"] = "1h"): string {
        try {
            return sign(payload, this.getSecret(), { expiresIn });
        } catch (error) {
            console.error("Error signing token:", error);
            throw error;
        }
    }

    static verifyToken<T = JwtPayload>(token: string): T {
        try {
            return verify(token, this.getSecret()) as T;
        } catch (error) {
            console.error("Error verifying token:", error);
            throw error;
        }
    }
}

export default JwtService;
