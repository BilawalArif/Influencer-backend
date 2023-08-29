// role-signup.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RoleMiddleware implements NestMiddleware {
  constructor(private readonly allowedRoles: string[]) {}

  use(req: Request, res: Response, next: NextFunction) {
    const desiredRole = req.body.role; // Assuming the desired role is sent in the request body

    if (!this.allowedRoles.includes(desiredRole)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    next();
  }
}
