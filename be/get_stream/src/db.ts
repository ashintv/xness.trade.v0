import format from 'pg-format';
import { Client } from "pg";

export async function batchPushToDb(client: Client, query: string, batch: any[]){
	try{
		const formattedQuery = format(query, batch);
		await client.query(formattedQuery);
		console.log('Update successful', client.database);
	}catch(e){
		console.log('Update failed', client.database , e , batch);
	}
	
}
