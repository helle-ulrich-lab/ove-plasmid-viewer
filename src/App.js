import React from "react";
import { Editor, updateEditor } from "open-vector-editor";
import store from "./store";
import { genbankToJson } from 'bio-parsers';

import "./App.css";

async function AsyncGetGenBankFileAsOveJson(file_name) {
  let data = await fetch(
    new Request("/uploads/" + file_name, {
      //probably don't need this header.. fetch should just work
      headers: { "X-Requested-With": "XMLHttpRequest" }
    })
  )
    .then((response) => response.text())
    .then((text) => genbankToJson(text)[0]["parsedSequence"])
    .catch(console.error);
  // console.log(`data:`, data); //is this defined and working?
  return data;
}

function App() {
  // Get GET parameters from url and store them in a variable
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const fileName = params.get("file_name");
  const title = params.get("title");

  React.useEffect(() => {
    //useEffect doesn't like top level async functions so we define one inline and immediately invoke it
    (async () => {
      // Get plasmid as OVE JSON
      const seqData = await AsyncGetGenBankFileAsOveJson(fileName);
      seqData.name = title;
      const plasmid_length = seqData.size;

      // Remove features that do not need to be shown, ever!
      for (let i = 0; i < seqData.features.length; i++) {
        const feat = seqData.features[i];
        const feat_name = feat.name.toLowerCase();
        if (
          (feat_name === "synthetic dna construct" ||
            feat_name === "recombinant plasmid") &&
          plasmid_length === feat.end - feat.start + 1
        ) {
          delete seqData.features[i];
        }
      }

      updateEditor(store, "DemoEditor", {
        sequenceData: seqData,
        circular: seqData.circular,
        annotationVisibility: {
          features: true,
          cutsites: false,
          primers: false
        }
      });
      
    })();
  }, [title, fileName]);

  const editorProps = {
    editorName: "DemoEditor",
    isFullscreen: true,
    showMenuBar: false,
    readOnly: true,
    ToolBarProps: {
      toolList: [
        "cutsiteTool",
        "featureTool",
        "oligoTool",
        "orfTool",
        "findTool",
        "visibilityTool",
      ]
    },
    PropertiesProps: {
      propertiesList: [
        "features",
        "primers",
        "translations",
        "cutsites",
        "orfs",
      ]
    },
    StatusBarProps: {
      showCircularity: true,
      showReadOnly: false,
      showAvailability: false
    },
  };

  return (
    <div>
      <Editor {...editorProps} />
    </div>
  );
}

export default App;