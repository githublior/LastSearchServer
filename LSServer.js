

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 8080; 




// Connect to MongoDB database
const uri = "mongodb+srv://liorcbh:<password>@cluster0.pszlslj.mongodb.net/?retryWrites=true&w=majority";
async function connectMDB(){
    try{
        await mongoose.connect(uri);
        console.log("connected to MongoDB");
    }catch(error){
        console.error(error);
    }
}
connectMDB();


//Mongo DB

// Define a schema, user oriented
const userSchema = new mongoose.Schema({
    userId: String,
    searchPhrase: String,
    time:  { type: Date, default: Date.now },
});

const userHistory = mongoose.model('userHistory', userSchema);

  
  // Define a schema, searchPhrase oriented
const phraseSchema = new mongoose.Schema({
    searchPhrase: String,
    hit: Number,
});
const phraseCount = mongoose.model('phraseCount', phraseSchema);





// second version if only a single collection is available

/*
// schema definition
const SearchSchema = new mongoose.Schema({
    userId: String,
    searchPhrase: String,
    hit : Number,
    time:  { type: Date, default: Date.now },
});
// collection instantiation
const Search = mongoose.model('Search', SearchSchema);

//POST/lastSearch
app.post('/lastSearch', async(req,res)=>{
    try{
        const {userId, searchPhrase}= req.body;
        if (!userId || !searchPhrase){
            res.status(400).json({});
        }else{

            Search.findOne({ searchPhrase: searchPhrase }).sort({ time: -1 }).select('hit').exec((err, result) =>{
                if (err) {
                console.error(err);
                } else {
                    let hit=1;
                    if (result) {
                        hit = result.hit + 1;
                    }
                }
            });
            const newSearch = new Search({ userId, searchPhrase, hit });
            await newSearch.save();

            res.status(201).json({});
        }
    } catch (error) {
        res.status(500).json({});
    }
});

*/

app.use(bodyParser.json());

//GET / 
app.get('/', (req, res)=> {
    res.send('Search landing page.');
});

//GET/hello
app.get('/hello', (req, res) => {
    res.status(200).json();
  });
  



//POST/lastSearch
app.post('/lastSearch', async (req, res) => {
    try {
      const { userId, searchPhrase } = req.body;
      if (!userId || !searchPhrase) {
        res.status(400).json();
      } else {
        const result = await phraseCount.findOne({ searchPhrase: searchPhrase }).exec();
        var hit = 1;
        if (result) {
          hit = result.hit + 1;
          await phraseCount.deleteOne({ searchPhrase: searchPhrase }).exec();
        }
        const newPhrase = new phraseCount({
          searchPhrase: searchPhrase,
          hit: hit,
        });
        await newPhrase.save();
  
        const newSearch = new userHistory({ userId, searchPhrase });
        await newSearch.save();
  
        res.status(201).json();
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

//GET /health

app.get('/health', (req, res) => {
  const db = mongoose.connection;

  if (db.readyState === 1) {
    // Database connection is open (readyState 1)
    res.status(200).json(); 
  } else {
    // Database connection is not OK
    res.status(500).send('Database connection is not OK');
  }
});
 

//GET /lastSearches?userId=X&limit=N
app.get('/lastSearches', async(req, res) => {
    const { userId, limit } = req.query; //add default value
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  
    const lastSearches = await userHistory
            .find({ userId, time: { $gte: twoWeeksAgo } })
            .sort({ time: -1 })
            .limit(limit)
            .select('searchPhrase -_id');
            const searchPhrases = lastSearches.map(entry => entry.searchPhrase);

    //const lastSearches = searches.map((search) => search.searchPhrase);
    res.status(200).json({ lastSearches });
    });
  


app.get('/mostPopular', async(req, res) => {
    const {limit} = req.query;
    const mostPopularPhrases = await phraseCount
            .find()
            .sort({ hit: -1 })
            .limit(limit)
            .select('searchPhrase hit -_id');
           

    res.status(200).json(mostPopularPhrases);
    });    

      




// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
