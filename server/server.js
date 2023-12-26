// const mongoose = require("mongoose")
// const Document = require("./Document")
// mongoose.connect('mongodb+srv://krishiagrawal:saral123@cluster0.cmr5rm7.mongodb.net/google-docs-clone',
//   {
//     // useNewUrlParser: true,
//     // useFindAndModify: false,
//     // useUnifiedTopology: true,
//     // useCreateIndex: true,
//   }
// );

// const io = require("socket.io")(3001, {
//     cors: {
//         origin: "http://localhost:3000",
//         methods: ["GET", "POST"]
//     }
// })

// const defaultValue = ""
// io.on("connection", socket => {
//     // console.log("connected at ", socket.id)
//     socket.on("get-document", documentId => {
//             const document = findOrCreateDocument(documentId)
//             socket.join(documentId)
//             socket.emit("load-document", document.data)

//             socket.on("send-changes", delta => { 
//                 socket.broadcast.to(documentId).emit("receive-changes", delta)
//             })
//             socket.on("save-document", async data => {
//                 // console.log("saved")
//                 await Document.findByIdAndUpdate(documentId, { data })
//             })
//         })
//     })

// async function findOrCreateDocument(id) {
//     if (id == null) return
//     const document = await Document.findById(id)
//     if (document) return document
//     return await Document.create({_id: id, data: defaultValue})
// }
const mongoose = require("mongoose");
const Document = require("./Document");
mongoose.connect(
  'mongodb+srv://krishiagrawal:saral123@cluster0.cmr5rm7.mongodb.net/google-docs-clone',
  {
    // useNewUrlParser: true,
    // useFindAndModify: false,
    // useUnifiedTopology: true,
    // useCreateIndex: true,
  }
);

const io = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const defaultValue = "";
io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data, callback) => {
      try {
        await Document.findByIdAndUpdate(documentId, { data });
        // callback({ success: true });
      } catch (error) {
        console.error("Error saving document:", error);
        // callback({ success: false, error: "Failed to save document." });
      }
    });
  });
});

async function findOrCreateDocument(id) {
  if (id == null) return;
  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: defaultValue });
}
