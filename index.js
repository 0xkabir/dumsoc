const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;

const app = express()

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ipnjwkc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        const postsCollection = client.db('dumSoc').collection('posts')
        const commentsCollection = client.db('dumSoc').collection('comments')
        const likedPostsCollection = client.db('dumSoc').collection('likedPosts')

        app.get('/posts', async(request, response) => {
            const query = {}
            const posts = await postsCollection.find(query).toArray()
            response.send(posts)
        })

        app.post('/post-update', async(request, response) => {
            const post = request.body
            const result = await postsCollection.insertOne(post)
            response.send(result)
        })

        app.post('/post-comment', async(request, response) => {
            const comment = request.body
            const result = await commentsCollection.insertOne(comment)
            response.send(result)

            
        })
        app.get('/comments/:postId', async(request, response)=>{
            const postId = request.params.postId
            const query = {postId: postId}
            const result = await commentsCollection.find(query).toArray()
            response.send(result)
        })

        app.put('/update-likes/:postId', async(request, response) => {
            const postId = request.params.postId
            const likesCount = request.body.likes
            const filter = {_id: new ObjectId(postId)}
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    likes: likesCount
                }
            }

            const result = await postsCollection.updateOne(filter, updateDoc, options)
            response.send(result)
        })
        app.put('/update-comment-count/:postId', async(request, response) => {
            const postId = request.params.postId
            const commentsCount = request.body.comments
            const filter = {_id: new ObjectId(postId)}
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    comments: commentsCount
                }
            }

            const result = await postsCollection.updateOne(filter, updateDoc, options)
            response.send(result)
        })
    }
    finally{

    }
}

run().catch(console.dir);

app.get('/', (request, response) => {
    response.send('DumSoc Server running')
})

app.listen(port, ()=>{
    console.log(`DumSoc Server running at port ${port}`)
})