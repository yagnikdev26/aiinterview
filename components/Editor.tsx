import React, { useState } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript'; // Add more modes as needed

const languages = [
  { name: 'JavaScript', mode: 'javascript' },
  { name: 'Python', mode: 'python' },
  // Add more languages here
];

const CodeEditor = () => {
  const [code, setCode] = useState('// Write your code here');
  const [language, setLanguage] = useState(languages[0].mode);
  const [output, setOutput] = useState('');

  const handleRun = () => {
    console.log(`Running code in ${language}:`, code);
    
  };

  const handleSubmit = () => {
    console.log(`Submitting code in ${language}:`, code);
  };

  return (
    <div>
      <h1>Code Editor</h1>
      <select onChange={(e) => setLanguage(e.target.value)} value={language}>
        {languages.map((lang) => (
          <option key={lang.mode} value={lang.mode}>
            {lang.name}
          </option>
        ))}
      </select>
      <CodeMirror
        value={code}
        options={{
          lineNumbers: true,
          mode: language,
        //   theme: 'material',
        }}
        onBeforeChange={(editor, data, value) => {
          setCode(value);
        }}
      />
      <button onClick={handleRun}>Run</button>
      <button onClick={handleSubmit}>Submit</button>
      <div>
        <h2>Output:</h2>
        <pre>{output}</pre>
      </div>
    </div>
  );
};

export default CodeEditor;