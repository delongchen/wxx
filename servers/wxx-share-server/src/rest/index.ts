import { app } from './instance';
import { router } from './router';

app.use(router.routes());
app.use(router.allowedMethods());

export { app };
