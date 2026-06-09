
import { db, courses } from "#db";

export class UsersCoursesServices {
    private readonly db = db;

    async getAllCourses() {
        return this.db
            .select()
            .from(courses)
            .orderBy(courses.createdAt);
    }
}
