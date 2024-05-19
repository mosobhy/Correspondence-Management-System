import { correspondants } from "../database/database.mongoose";

// sync correspondences
let stream = correspondants.synchronize();
let count = 0;

stream.on('data', (err: any, doc: any) => {
  count++;
});

stream.on('close', () => {
  console.log('indexed ' + count + ' documents!');
});

stream.on('error', (err: any) => {
    console.log('inside of the mongoosasitc err')
  console.log(err);
});


console.log(55555555)