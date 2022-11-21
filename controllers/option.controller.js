const catchAsync = require("../utils/catchAsync");
const httpStatus = require("http-status");
const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
const xml2js = require("xml2js");
const unzipper = require("unzipper");
const { Document, Segment } = require("../models");
const AdmZip = require("adm-zip");
const { zip } = require("zip-a-folder");

const convertToArray = (rows) => {
  if (Array.isArray(rows)) {
    return rows;
  } else return [rows];
};

const getTextFromParagraph = (paragraphs) => {
  const texts = [];
  paragraphs.forEach((paragraph) => {
    // newSegments.push(paragraph);
    const rows = convertToArray(paragraph["w:r"]);
    rows.forEach((row) => {
      if (row["w:t"]) texts.push(row["w:t"]);
    });
  });
  return texts;
};

exports.save = catchAsync(async (req, res, next) => {
  var dir = path.join(
    __dirname,
    "../public/uploads/xml",
    req.file.filename.split(".zip")[0]
  );

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  await fs
    .createReadStream(req.file.path)
    .pipe(
      unzipper.Extract({
        path: path.join(
          __dirname,
          "../public/uploads/xml",
          req.file.filename.split(".zip")[0]
        ),
      })
    )
    .promise();

  console.log(req.file);

  const document = new Document({
    fileName: req.file.filename.split(".zip")[0],
    path: dir + "/word/document.xml",
    ext: req.file.originalname.split(".")[1],
  });

  const newDocument = await document.save();
  return res.json({
    newDocument,
  });
});

exports.getDoducmentById = catchAsync(async (req, res, next) => {
  const pageQuery = req.query.page;
  const document = await Document.findOne({ _id: req.params.documentId });

  var parser = new xml2js.Parser({
    explicitArray: false,
    attrkey: "_attributes",
  });
  fs.readFile(document.path, function (err, data) {
    parser.parseString(data, async function (err, result) {
      let ans = [];

      paragraphs = result["w:document"]["w:body"]["w:p"].filter(
        (page, index) => {
          console.log(page);
          return index <= pageQuery;
        }
      );

      result["w:document"]["w:body"]["w:p"] = [...paragraphs];

      let destDir = path.join(__dirname, "../public/uploads/xml/xml-render");
      let srcDir = document.path.split("/word/document.xml")[0];

      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(dir);
      }

      // To copy a folder or file, select overwrite accordingly
      try {
        fse.copySync(srcDir, destDir, { overwrite: true | false });
        console.log("success!");
      } catch (err) {
        console.error(err);
      }

      var builder = new xml2js.Builder();
      var xml = builder.buildObject(result);

      fs.writeFile(
        path.join(destDir, "/word/document.xml"),
        xml,
        function (err, data) {
          if (err) console.log(err);
          console.log("successfully written our update xml to file");
        }
      );
      return res.json({
        result,
        // result: result["w:document"]["w:body"]["w:p"],
      });
    });
  });

  // console.log(document);

  // return res.json({
  //   document,
  // });
});

exports.upload = catchAsync(async (req, res, next) => {
  await fs
    .createReadStream(req.file.path)
    .pipe(
      unzipper.Extract({ path: path.join(__dirname, "../public/uploads/xml") })
    )
    .promise();

  var parser = new xml2js.Parser({
    explicitArray: false,
    attrkey: "_attributes",
  });
  fs.readFile(
    path.join(path.join(__dirname, "../public/uploads/xml/word/document.xml")),
    function (err, data) {
      parser.parseString(data, async function (err, result) {
        // const appXML = fs.readFileSync(
        //   path.join(__dirname, "../public/uploads/xml/docProps/app.xml"),
        //   { encoding: "utf8" }
        // );
        // Create new document.
        // const document = new Document({
        //   fileName: req.file.originalname,
        //   ext: req.file.originalname.split(".")[
        //     req.fie.originalname.split(".").length - 1
        //   ],
        //   path: req.file.destination + req.file.fileName,
        //   pages: appXML.split("<Pages>")[1].split("</Pages>")[0],
        // });

        // const newDocument = await document.save();
        // Create many segmentsl

        let segments = [];
        const body = result["w:document"]["w:body"];

        const tables = convertToArray(body["w:tbl"]);
        tables.forEach((table) => {
          const tableRows = convertToArray(table["w:tr"]);
          tableRows.forEach((tableRow) => {
            const tableCells = convertToArray(tableRow["w:tc"]);
            tableCells.forEach((tableCell) => {
              const paragraphs = convertToArray(tableCell["w:p"]);
              paragraphs.forEach((paragraph) => {
                const rows = convertToArray(paragraph["w:r"]);
                for (let row of rows) {
                  let segmentDoc;
                  (async () => {
                    if (row["w:t"]) {
                      row["attr"] = row["attr"] || {};
                      const segmentDoc = await Segment.create({
                        type: "paragraph",
                        text: row["w:t"],
                      });
                      if (segmentDoc) {
                        console.log(segmentDoc._id.toString());
                        row["attr"]["key"] = segmentDoc._id.toString();
                      }
                    }
                  })();
                }
              });
            });
          });
        });

        const paragraphs = convertToArray(body["w:p"]);
        paragraphs.forEach((paragraph) => {
          // newSegments.push(paragraph);
          const rows = convertToArray(paragraph["w:r"]);
          for (let row of rows) {
            let segmentDoc;
            (async () => {
              if (row["w:t"]) {
                row["attr"] = row["attr"] || {};
                const segmentDoc = await Segment.create({
                  type: "paragraph",
                  text: row["w:t"],
                });
                if (segmentDoc) {
                  console.log(segmentDoc._id.toString());
                  row["attr"]["key"] = segmentDoc._id.toString();
                }
              }
            })();
          }
        });
        // segments = [...getTextFromParagraph(paragraphs)];
        // if (rows["w:t"]) {
        //   if(paragraph["w:r"]["w:t"])
        // newSegments.push(row);
        // const sentences = row["w:r"]["w:t"]
        //   .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")
        //   .split("|");
        // sentences.forEach((sentence) => {
        //   const segment = new Segment({
        //     document_id: newDocument._id,
        //     text: sentence,
        //   });
        //   segment.bold =
        //     row["w:r"]["w:rPr"]["w:b"]?.length == 0 ? true : false;
        //   segment.italic =
        //     row["w:r"]["w:rPr"]["w:i"]?.length == 0 ? true : false;
        //   segment.underline =
        //     row["w:r"]["w:rPr"]["w:u"]?.length == 0 ? true : false;
        //   segment.strike =
        //     row["w:r"]["w:rPr"]["w:strike"]?.length == 0 ? true : false;
        //   (async () => {
        //     const newSegment = await segment.save();
        //     newSegments.push(newSegment);
        //   })();
        //   console.log(row["w:r"]["w:rPr"]["w:i"]?.length == 0);
        // });
        // }
        // for (let segment of segments) {
        //   const segmentDoc = new Segment({
        //     text: segment.text,
        //     type: segment.type,
        //   });
        //   await segmentDoc.save();
        // }
        // console.log(segments);

        return res.json({
          result,
          segments,
        });
      });
    }
  );

  // res.json({
  //   msg: "Upload file successfully",
  //   data: req.file,
  // });
});

exports.update = catchAsync(async (req, res, next) => {
  const { index } = req.body;
  const segments = await Segment.find({});
  const tableLength = await Segment.find({ type: "table" }).countDocuments();
  if (index > tableLength - 1) {
    fs.readFile(
      path.join(
        path.join(__dirname, "../public/uploads/xml/word/document.xml")
      ),
      function (err, data) {
        parser.parseString(data, async function (err, result) {
          const appXML = fs.readFileSync(
            path.join(__dirname, "../public/uploads/xml/docProps/app.xml"),
            { encoding: "utf8" }
          );
          let segments = [];
          const body = result["w:document"]["w:body"];

          const paragraphs = convertToArray(body["w:p"]);
          paragraphs.forEach((paragraph) => {
            // newSegments.push(paragraph);
            const rows = convertToArray(paragraph["w:r"]);
            rows.forEach((row) => {
              if (row["w:t"])
                segments.push({
                  type: "paragraph",
                  text: row["w:t"],
                });
            });
          });
        });
      }
    );
  }
  res.json({
    segments,
    tableLength,
  });
});

exports.writeFile = catchAsync(async (req, res, next) => {
  await zip(
    path.join(__dirname, "../public/uploads/xml"),

    path.join(__dirname, "../public/zip/file.zip")
  );

  res.json({
    msg: "successfully",
  });
});
