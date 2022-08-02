const catchAsync = require("../utils/catchAsync");
const httpStatus = require("http-status");
const path = require("path");
const fs = require("fs");
const xml2js = require("xml2js");
const unzipper = require("unzipper");
const { Document, Segment } = require("../models");

exports.upload = catchAsync(async (req, res, next) => {
  await fs
    .createReadStream(req.file.path)
    .pipe(unzipper.Extract({ path: path.join(__dirname, "../public/uploads") }))
    .promise();

  var parser = new xml2js.Parser({ explicitArray: false });
  fs.readFile(
    path.join(path.join(__dirname, "../public/uploads/word/document.xml")),
    function (err, data) {
      parser.parseString(data, async function (err, result) {
        const appXML = fs.readFileSync(
          path.join(__dirname, "../public/uploads/docProps/app.xml"),
          { encoding: "utf8" }
        );
        // Create new document.
        const document = new Document({
          fileName: req.file.originalname,
          ext: req.file.originalname.split(".")[
            req.file.originalname.split(".").length - 1
          ],
          path: req.file.destination + req.file.fileName,
          pages: appXML.split("<Pages>")[1].split("</Pages>")[0],
        });

        const newDocument = await document.save();
        // Create many segments
        const newSegments = [];
        result["w:document"]["w:body"]["w:p"].forEach((row) => {
          if (row["w:r"]["w:t"]) {
            const sentences = row["w:r"]["w:t"]
              .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")
              .split("|");
            sentences.forEach((sentence) => {
              const segment = new Segment({
                document_id: newDocument._id,
                text: sentence,
              });
              segment.bold =
                row["w:r"]["w:rPr"]["w:b"]?.length == 0 ? true : false;
              segment.italic =
                row["w:r"]["w:rPr"]["w:i"]?.length == 0 ? true : false;
              segment.underline =
                row["w:r"]["w:rPr"]["w:u"]?.length == 0 ? true : false;
              segment.strike =
                row["w:r"]["w:rPr"]["w:strike"]?.length == 0 ? true : false;
              (async () => {
                const newSegment = await segment.save();
                newSegments.push(newSegment);
              })();
              console.log(row["w:r"]["w:rPr"]["w:i"]?.length == 0);
            });
          }
        });
        // console.log(result["w:document"]["w:body"]["w:p"]?.length);
        return res.json({
          newDocument,
          newSegments,
          result,
        });
      });
    }
  );

  // res.json({
  //   msg: "Upload file successfully",
  //   data: req.file,
  // });
});
