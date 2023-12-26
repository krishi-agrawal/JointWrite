const mongoose = require("mongoose");
const Document = require("./Document");
require("dotenv").config()
mongoose.connect(
  process.env.MONGO_URI, {}
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
