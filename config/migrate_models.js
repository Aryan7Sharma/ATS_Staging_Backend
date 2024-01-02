//Synchronize the model with the database and create the table if it doesn't exist
const migrate  = async (db) => {
    try {
      await db.sync();
      //console.log('Model synchronized successfully.');
    } catch (error) {
      console.error('Error synchronizing the model:', error);
    }
  };


//migrate();
module.exports = migrate;