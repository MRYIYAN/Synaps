import React from "react";
import NoteTree           from "../../NoteTree/NoteTree.jsx";
import OptionPanelButton  from "./OptionPanelButton.jsx";


import { ReactComponent as FilterSort } from "../../../assets/icons/filter-sort.svg";
import { ReactComponent as NewFolder  } from "../../../assets/icons/new-folder.svg";
import { ReactComponent as NewFile    } from "../../../assets/icons/new-file.svg";

// Lista plana de notas de ejemplo
const notes = [
  { id2: "n1", title: "Tareas", parent_id: null },
  { id2: "n2", title: "Proyecto A", parent_id: "n1" },
  { id2: "n3", title: "Diseño", parent_id: "n2" },
  { id2: "n4", title: "Frontend", parent_id: "n2" },
  { id2: "n5", title: "Proyecto B", parent_id: "n1" },
  { id2: "n6", title: "Ideas sueltas", parent_id: null },
];

const FoldersPanel = () => {
  return (
    <div className="options-panel-content">
      <div className="options-panel">
        <OptionPanelButton icon={NewFolder}  />
        <OptionPanelButton icon={NewFile}    />
        <OptionPanelButton icon={FilterSort} />
      </div>

      <NoteTree nodes={notes} selectedId2="n3" />
    </div>
  );
};

export default FoldersPanel;