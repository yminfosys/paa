var mongoose = require('mongoose');

//mongoose.set('useFindAndModify', false);
autoIncrement = require('mongoose-auto-increment');
const config = {
  autoIndex: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  
};
const mongojs = require('mongojs');
// const db = mongojs('mongodb://127.0.0.1:27017/admin', ['pilotcollections'])
//var uri='mongodb://sukanta82:sukanta82@ds149138.mlab.com:49138/mws';
//var uri='mongodb://sukanta82:sukanta82@ds163517.mlab.com:63517/mws';
//var uri='mongodb://localhost:27017/paacab';
//var uri='mongodb://127.0.0.1:27017/admin';
var uri='mongodb+srv://paacab:a1b1c3b4@paa-x8lgp.mongodb.net/paacab?retryWrites=true&w=majority';
///&connectTimeoutMS=1000&bufferCommands=false
///2dsphar indexing creat///////
function index2Dpilot(int,cb){
  console.log()
    const db = mongojs('mongodb+srv://paacab:a1b1c3b4@paa-x8lgp.mongodb.net/paacab?retryWrites=true&w=majority', ['pilotcollections'])
    db.pilotcollections.createIndex({ "location" : "2dsphere" });
    cb({success:'1'});
  }

  // function index2Dpilot(int,cb){
  //   console.log()
  //     const db = mongojs('mongodb://localhost:27017/paacab', ['pilotcollections'])
  //     db.pilotcollections.createIndex({ "location" : "2dsphere" });
  //     cb({success:'1'});
  //   }
  function index2Ddemand(int,cb){
    console.log()
      const db = mongojs('mongodb+srv://paacab:a1b1c3b4@paa-x8lgp.mongodb.net/paacab?retryWrites=true&w=majority', ['demandcollections']);
      db.demandcollections.createIndex({ "location" : "2dsphere" });
      cb({success:'1'})
    }
function mongCon(){
mongoose.connect(uri,config).
catch(error => handleError(error));
}
mongCon();
mongoose.connection.on('error', err => {
  //logError(err);
  console.log(err)
  setTimeout(mongCon,20000);
  
});
autoIncrement.initialize(mongoose.connection);

////customer Schema
var custSchema = new mongoose.Schema({ 
    name:  String,
    email :String,
    address:String,
    postcode:String,
    password: String,    
    mobileNumber:String, 
    isdCode:String,       
    CustID:String,
    custRating:String,   
    userType:String,
    orderStage:String,
    preRidePriceperKm:[],
    regdate: { type: Date, default: Date.now },
    lastLogindate: { type: Date },
    location: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'], // 'location.type' must be 'Point'
        required: true
      },
      coordinates: {
        type: [Number],
        required: true,
        
      }
    }
});

custSchema.plugin(autoIncrement.plugin, { model: 'custcollections', field: 'CustID',startAt: 1000, incrementBy: 1 });

var custmodul = mongoose.model('custcollections', custSchema);


///Pilot Schema
var pilotSchema = new mongoose.Schema({ 
  name:  String,
  email :String,
  address:String,
  city:String,
  postcode:String,
  password: String,    
  mobileNumber:String,
  isdCode:String,    
  pilotID:String,
  pilotRating:String,
  /////price per km 
  pilotGetperKm:String,
  accountStatus:String,
  completereg:String,   
  userType:String,
  typeOfWork:[],
  travelmod:String,
  rtoRegno:String,
  carModel:String,
  duty:String, 
  bankAccountNo:String,
  ifsc:String,
  sortCode:String, 
  jobCategory:String,
  jobSubCategory:String,
  ageGroup:String,
  experance:String,
  panNumber:String,
  gender:String,
  photo:String,Idproof:String,dl:String,rto:String,insurence:String,polution:String,
  orderStage:String,
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      
    }
  }
});

pilotSchema.plugin(autoIncrement.plugin, { model: 'pilotcollections', field: 'pilotID',startAt: 1000, incrementBy: 1 });

var pilotmodul = mongoose.model('pilotcollections', pilotSchema);

///Ride book Schema
var rideSchema = new mongoose.Schema({ 
  bookingID:  String,
  pilotID :String,
  CustID:String,
  picupaddress:String,
  picuklatlng: [],    
  dropaddress:String,     
  droplatlng:[],
  date: { type: Date, default: Date.now },
  startTime:String,   
  endTime:String,
  kmtravels:String,
  totalamount:String,
  paymentBy:String,
  driverCashCollectio:String,
  discount:String,
  driverpayout:String,
  driverIncentiv:String,
  callbookingStatus:String  
});

//rideSchema.plugin(autoIncrement.plugin, { model: 'ridecollections', field: 'bookingID',startAt: 1000, incrementBy: 1 });

var ridemodul = mongoose.model('ridecollections', rideSchema);

///Ride book Schema Counter
var rideCountSchema = new mongoose.Schema({ 
  bookingID:  String,   
});

//rideSchema.plugin(autoIncrement.plugin, { model: 'ridecollections', field: 'bookingID',startAt: 1000, incrementBy: 1 });

var rideCountmodul = mongoose.model('rideCountcollections', rideCountSchema);



///Price and Offer Mnager
var priceandOfferSchema = new mongoose.Schema({ 
  offerID:  String,
  area:String,
  CustID:String,
  travelmod:String,
  price:String,
  discount: String,    
  cupon:String,     
  distanceKM:String, 
  rideIncetiv:String 
});

priceandOfferSchema.plugin(autoIncrement.plugin, { model: 'priceandOffercollections', field: 'offerID',startAt: 1, incrementBy: 1 });


var priceandOffermodul = mongoose.model('priceandOffercollections', priceandOfferSchema);

////Demand Area Schema
var demandSchema = new mongoose.Schema({ 
  CustID:String,
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      
    }
  }
});

var demandmodul = mongoose.model('demandcollections', demandSchema);

////Driver Location Schema
// var demandSchema = new mongoose.Schema({ 
//   pilotID:String,
//   location: {
//     type: {
//       type: String, // Don't do `{ location: { type: String } }`
//       enum: ['Point'], // 'location.type' must be 'Point'
//       required: true
//     },
//     coordinates: {
//       type: [Number],
//       required: true,
      
//     }
//   }
// });

// var demandmodul = mongoose.model('demandcollections', demandSchema);


var sampleSchema=new mongoose.Schema({ 
  name: String,
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      
    }
  }
})
sampleSchema.index({ location: '2dsphere'});

var sampleModule = mongoose.model('dadacollections', sampleSchema);

// custmodul({
//   name:'sukanta sardar',
//   location:{type:'Point',coordinates:[22.572646, 88.38389500000001]}
// }).save(function(r){
//   console.log("created");
// })
// db.mamacollections.find(function (err, docs) {
//   //docs is an array of all the documents in mycollection
//   console.log('mongojs test',docs);
// })
// db.dadacollections.createIndex({ "location" : "2dsphere" })
// sampleModule.find({
//   location: {
//     $near: {
//       $geometry: {
//          type: "Point" ,
//          coordinates: [ 87.8258247, 23.0101451 ]
//       },
//     }
//   }
// },function(e,data){
//   console.log('test result',JSON.stringify(data) );
// })

// index2Dpilot({},function(ss){
//   pilotmodul.find({
//     location: {
//       $near: {
//         $geometry: {
//            type: "Point" ,
//            coordinates: [ 87.2729185, 23.6662132 ]
//         },$maxDistance : 100000,
//       }
//     },pilottID:1000
//   },function(e,data){
//     console.log('test result',JSON.stringify(data) );
//   })
// })
// index2Dcust({},function(ss){
//   custmodul.find({
//     location: {
//       $near: {
//         $geometry: {
//            type: "Point" ,
//            coordinates: [ 87.8258247, 22.0101451 ]
//         },$maxDistance : 10000000,
//       }
//     },CustID:1000
//   },function(e,data){
//     console.log('test result',JSON.stringify(data) );
//   })
// })



module.exports.customer=custmodul;
module.exports.pilot=pilotmodul;
module.exports.index2Dpilot=index2Dpilot;
module.exports.index2Ddemand=index2Ddemand;
module.exports.ride=ridemodul;
module.exports.rideCounter=rideCountmodul;
module.exports.priceOffer=priceandOffermodul;
module.exports.demandArea=demandmodul;