import 'dotenv/config';
import { db } from './index';
import { users } from './schema';

async function main() {
    try {
        console.log('Testing DB connection...');
        const result = await db.select().from(users).limit(1);
        console.log('Connection successful!');
        console.log('Users found:', result.length);
    } catch (error) {
        console.error('Connection failed:', error);
    }
}

main();
