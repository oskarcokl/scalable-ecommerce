import db from './services/database';
import './db/schema';

(async () => {
    const res = await db.execute('select 1');
    console.log(res);
})();
