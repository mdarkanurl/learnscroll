import { Hono } from 'hono';
import { isAuthenticated } from "#middlewares";
import zodVaildation from '#validation';
import { UpdateSectionSchema } from '../../dto/update-section.dto';
import { CreateSectionSchema } from '../../dto/create-section.dto';
import adminLecturesRouters from './admin.lectures.routers';
import { AdminSectionsControllers } from "../../controllers";

const adminSectionsRouters = new Hono();
const adminSectionsControllers = new AdminSectionsControllers();

adminSectionsRouters.post(
    '/',
    isAuthenticated(),
    zodVaildation(CreateSectionSchema),
    (c) => adminSectionsControllers.createSection(c)
);

adminSectionsRouters.put(
    '/:sectionId',
    isAuthenticated(),
    zodVaildation(UpdateSectionSchema),
    (c) => adminSectionsControllers.updateSection(c)
);

adminSectionsRouters.delete(
    '/:sectionId',
    isAuthenticated(),
    (c) => adminSectionsControllers.deleteSection(c)
);

adminSectionsRouters.route("/lectures/:courseId/:sectionId", adminLecturesRouters);

export default adminSectionsRouters;
