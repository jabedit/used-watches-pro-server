require('dotenv').config()
const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const cors = require('cors')
const color = require('colors')
const PORT = process.env.PORT || 5000
const app = express()

app.use(cors())
app.use(express.json())

const uri = process.env.MongoDb_URL
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
})

const run = async () => {
  try {
    // database create
    const database = client.db('watchPro')
    const users = database.collection('users')
    const laptop_category = database.collection('laptop-category')
    const laptops = database.collection('laptops')
    const bookedLaptops = database.collection('booked-laptops')
    const promoteLaptops = database.collection('promote-laptops')
    const reportedLaptops = database.collection('reported-laptops')

    // 1. get all users
    app.get('/users', async (req, res) => {
      const query = {}
      const products = await users.find(query).toArray()
      res.send(products)
    })

    // check valid user
    app.get('/user-get-by-email/v1', async (req, res) => {
      const email = req.query.email
      const query = { email: email }
      const result = await users.findOne(query)
      res.send(result)
    })
    // get user by google id
    app.get('/user-get-by-google-id/v1', async (req, res) => {
      const uid = req.query.uid
      const query = { uid_get: uid }
      const result = await users.findOne(query)
      res.send(result)
    })

    // edit users
    app.put('/users', async (req, res) => {
      const data = req.body
      const filter = { email: data.email }
      const options = { upsert: true }
      const updateDoc = {
        $set: {
          name: data.name,
          email: data.email,
          user_img: data.user_img,
        },
      }
      const result = await users.updateOne(filter, updateDoc, options)

      res.send(result)
    })

    // delete user by id
    app.delete('/users', async (req, res) => {
      const data = req.query.id
      console.log(data)
      const query = { _id: ObjectId(data) }
      const result = await users.deleteOne(query)
      res.send(result)
      console.log(result)
    })

    // verify users
    app.put('/users/veryfy', async (req, res) => {
      const data = req.body
      const filter = { _id: ObjectId(data.user_id) }
      const options = { upsert: true }
      const updateDoc = {
        $set: {
          user_verified: data.user_verified,
        },
      }
      const result = await users.updateOne(filter, updateDoc, options)
      res.send(result)
    })

    // 1. get all users by sorting
    app.get('/users-seller', async (req, res) => {
      const query_data = req.query.user
      const query = { userRole: query_data }
      const usersss = await users.find(query).project({ password: 0 }).toArray()
      res.send(usersss)
    })

    app.get('/users-profile/:id', async (req, res) => {
      const user = req.params.id
      const query = { email: user }
      const result = await users.find(query).project({ password: 0 }).toArray()
      res.send(result)
    })

    // 2 create users
    app.post('/users', async (req, res) => {
      const user = req.body
      const result = await users.insertOne(user)
      res.send(result)
    })

    // AllUser Load By Product ID
    app.get('/users-get', async (req, res) => {
      const user_id = req.query.userid
      const query = { _id: ObjectId(user_id) }
      const result = await users.find(query).toArray()
      res.send(result)
    })

    // category
    // --------------------------------

    // get all categry
    app.get('/product-category', async (req, res) => {
      const query = {}
      const result = await laptop_category.find(query).toArray()
      res.send(result)
    })
    // get all categry by id
    app.get('/product-category-by-id/v1/:_id', async (req, res) => {
      const id = req.params._id
      const query = { _id: ObjectId(id) }
      const result = await laptop_category.findOne(query)
      res.send(result)
    })

    // add new categry
    app.post('/product-category', async (req, res) => {
      const data = req.body
      const result = await laptop_category.insertOne(data)
      res.send(result)
    })

    // delete categry
    app.delete('/product-category/:id', async (req, res) => {
      const data = req.params.id
      const query = { _id: ObjectId(data) }
      const result = laptop_category.deleteOne(query)
      res.send(result)
    })

    // seller laptops
    // --------------------------------

    // get laptops
    app.get('/laptops', async (req, res) => {
      const query = {}
      const result = await laptops.find(query).toArray()
      res.send(result)
    })
    // get laptops by id
    app.get('/laptops-get-by-id/v1', async (req, res) => {
      const id = req.query.id
      const query = { _id: ObjectId(id) }
      const result = await laptops.find(query).toArray()
      res.send(result)
    })

    // get counts laptops by brand id
    app.get('/laptops/count', async (req, res) => {
      const id = req.query.id
      const query = { brand_id: id }
      const result = await laptops.find(query).toArray()
      res.send(result)
    })

    // get seller laptops by email
    app.get('/laptops/email', async (req, res) => {
      const email = req.query.email
      const query = { user_email: email }
      const result = await laptops.find(query).toArray()
      res.send(result)
    })

    // get pormotio porduct
    app.get('/laptops/promotion-product/v1', async (req, res) => {
      const query = { promotion_product: true }
      const result = await laptops.find(query).toArray()
      res.send(result)
    })

    //update laptops for pormotion true
    app.put('/laptops/promotion-product/v1', async (req, res) => {
      const data = req.body
      const filter = { _id: ObjectId(data.laptop_id) }
      const option = { upsert: true }
      const updateDoc = {
        $set: {
          promotion_product: data.promotion_product,
        },
      }
      const result = await laptops.updateOne(filter, updateDoc, option)
      res.send(result)
    })

    // add laptops
    app.post('/laptops', async (req, res) => {
      const data = req.body
      const result = await laptops.insertOne(data)
      res.send(result)
    })

    // delete laptops
    app.delete('/laptops', async (req, res) => {
      const id = req.query.id
      const query = {
        _id: ObjectId(id),
      }
      const result = await laptops.deleteOne(query)
      res.send(result)
    })

    // =========================================================
    // get booked product
    app.get('/booked-laptop-get-by-user-email/v1', async (req, res) => {
      const email = req.query.email
      const query = { booking_user_email: email }
      const result = await bookedLaptops.find(query).toArray()
      res.send(result)
    })

    // get booked product by seller id
    app.get('/booked-laptop-get-by-seller-id/v1', async (req, res) => {
      const seller_id = req.query.seller_id
      const query = { seller: seller_id }
      const result = await bookedLaptops.find(query).toArray()
      res.send(result)
    })

    // booked
    app.post('/booked-laptop/v1', async (req, res) => {
      const data = req.body
      console.log(data)
      const result = await bookedLaptops.insertOne(data)
      res.send(result)
    })

    // repotedLaptops
    // =====================================================================
    // get reported items
    app.get('/reported-laptop/v1', async (req, res) => {
      const data = {}
      const result = await reportedLaptops.find(data).toArray()
      res.send(result)
    })
    // get reported items by id
    app.get('/get-reported-laptop-by-id/v1', async (req, res) => {
      const id = req.query.id
      const data = { _id: id }
      const result = await reportedLaptops.find(data).toArray()
      res.send(result)
    })
    // add reported items
    app.post('/reported-laptop/v1', async (req, res) => {
      const data = req.body
      const result = await reportedLaptops.insertOne(data)
      res.send(result)
    })

    // delete reported items
    app.delete('/reported-laptop/v1', async (req, res) => {
      const data = req.query.id
      const query = { _id: data }
      const result = await reportedLaptops.deleteOne(query)
      res.send(result)
    })
  } finally {
  }
}

run().catch((err) => console.log(err))

//   start
app.get('/', (req, res) => {
  res.send('<h1>Server is Runing</h1>')
})

app.listen(PORT, () => {
  console.log('Server Is Runing'.bgBlue)
})
