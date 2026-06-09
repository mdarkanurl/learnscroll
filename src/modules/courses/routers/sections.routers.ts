import { Hono } from 'hono';
import { isAuthenticated } from "#middlewares";
import zodVaildation from '#validation';
import { UpdateSectionSchema } from '../dto/update-section.dto';
import { CreateSectionSchema } from '../dto/create-section.dto';
import { SectionsControllers } from '../controllers/sections.controllers';
import { lecturesRouters } from './lectures.routers';

const sectionsRouters = new Hono();
const sectionsControllers = new SectionsControllers();

sectionsRouters.post(
    '/',
    isAuthenticated(),
    zodVaildation(CreateSectionSchema),
    (c) => sectionsControllers.createSection(c)
);

sectionsRouters.put(
    '/:sectionId',
    isAuthenticated(),
    zodVaildation(UpdateSectionSchema),
    (c) => sectionsControllers.updateSection(c)
);

sectionsRouters.delete(
    '/:sectionId',
    isAuthenticated(),
    (c) => sectionsControllers.deleteSection(c)
);

sectionsRouters.route("/lectures/:courseId/:sectionId", lecturesRouters);

export {
    sectionsRouters
}
