import React from "react";
import { Editor, updateEditor } from "open-vector-editor";
import store from "./store";
import { genbankToJson } from 'bio-parsers';

import "./App.css";

async function AsyncGetGenBankFileAsOveJson(file_name) {

  let data = await fetch(new Request("/uploads/" + file_name, { headers: { "X-Requested-With": "XMLHttpRequest" } }))
    .then(response => response.text())
    .then(text => genbankToJson(text)[0]["parsedSequence"])
    .catch(console.error);

  return data

}

function getGenBankFileAsOveJson(file_name) {
  var request = new XMLHttpRequest();
  request.open("GET", "/uploads/" + file_name, false);
  request.send(null);
  var json_out = genbankToJson(request.responseText)[0]["parsedSequence"];
  return json_out;
}


function App() {

  const search = window.location.search;
  const params = new URLSearchParams(search);

  var plasmid_json_array = getGenBankFileAsOveJson(params.get('file_name'));
  plasmid_json_array.name = params.get('title');
  var plasmid_length = plasmid_json_array.size;

  for (let i = 0; i < plasmid_json_array.features.length; i++) {
    var feat = plasmid_json_array.features[i];
    var feat_name = feat.name.toLowerCase();
    if ((feat_name === "synthetic dna construct" || feat_name === "recombinant plasmid") && plasmid_length === feat.end - feat.start + 1) {
      delete plasmid_json_array.features[i];
    }
  }

  React.useEffect(() => {
    updateEditor(store, "DemoEditor", {
      sequenceData: plasmid_json_array,
      circular: plasmid_json_array.circular,
      annotationVisibility: {
        features: true,
        cutsites: false,
        primers: false
      }
    });
  });
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
