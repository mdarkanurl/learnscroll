import { Hono } from 'hono';
import { isAuthenticated } from "#middlewares";
import zodVaildation from '#validation';
import { UpdateSectionSchema } from '../dto/update-section.dto';
import { CreateSectionSchema } from '../dto/create-section.dto';
import { SectionsControllers } from '../controllers/sections.controllers';

const sectionsRouters = new Hono();
const sectionsControllers = new SectionsControllers();

sectionsRouters.post(
    '/:courseId',
    isAuthenticated(),
    zodVaildation(CreateSectionSchema),
    (c) => sectionsControllers.createSection(c)
);

sectionsRouters.put(
    '/:courseId/:sectionId',
    isAuthenticated(),
    zodVaildation(UpdateSectionSchema),
    (c) => sectionsControllers.updateSection(c)
);

sectionsRouters.delete(
    '/:courseId/:sectionId',
    isAuthenticated(),
    (c) => sectionsControllers.deleteSection(c)
);

export {
    sectionsRouters
}
