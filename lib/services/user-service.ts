"use server";
import { count, eq } from "drizzle-orm";
import { db } from "../../db";
import { User, userModel } from "../../db/schema";

export async function getUserById(id: number) {
    const [foundUser] = await db
        .select()
        .from(userModel)
        .where(eq(userModel.id, id));

    if (!foundUser) {
        return null;
    }

    return foundUser;
}

export async function getUserByEmail(email: string) {
    console.log(email)
    const [foundUser] = await db
        .select()
        .from(userModel)
        .where(eq(userModel.email, email));

    if (!foundUser) {
        return null;
    }

    return foundUser;
}

export async function updateUser(id: number, givenUser: User) {
    const foundUser = await getUserById(id);

    if (!foundUser) {
        return null;
    }

    const { id: tmpId, ...props } = givenUser;

    const [updatedUser] = await db
        .update(userModel)
        .set({ ...foundUser, ...props })
        .where(eq(userModel.id, id));

    return updatedUser;
}

export async function createUser(user: User) {
    console.log(user)
    const foundUser = await getUserByEmail(user.email);
    console.log("found user:", foundUser);

    const { id: tmpId, ...props } = user;

    if (foundUser) {
        return null;
    }

    const [createdUser] = await db
        .insert(userModel)
        .values({ ...props })
        .returning();

    // TODO: Log the activity

    // TODO: Send the email

    // TODO: Send the whatsapp

    return createdUser;
}

export async function getAllUsers(page: number = 1, size: number = 10) {
    const offset = (page - 1) * size;

    const [users, totalUsers] = await Promise.all([
        db.select().from(userModel).limit(size).offset(offset),
        db.select({ count: count() }).from(userModel),
    ]);

    const totalPages = Math.ceil(totalUsers[0].count / size);

    return {
        users,
        currentPage: page,
        totalPages,
        totalUsers: totalUsers[0].count,
    };
}
