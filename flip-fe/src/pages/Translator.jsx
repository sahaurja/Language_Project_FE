import {useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom"
import axios from "axios"

function Translator() {
    const [entryText, setEntryText] = useState("");
    const [entryLanguage, setEntryLanguage] = useState("");
    const [outputLanguage, setOutputLanguage] = useState("");
    const [outputText, setOutputText] = useState("");
    const [userid, setUserID] = useState("");
    //optional image selection
    const [selectedFile, setSelectedFile] = useState(null)

    const navigate = useNavigate()
    //check if alr logged in, else redirect 
    useEffect(() => {
        async function fetchLoginStatus(){
            const login_res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/verifyUser`, {withCredentials:true})
            console.log(login_res.data.success)
            if(!login_res.data.success){
                navigate("/login")
            }
            else{
                setUserID(login_res.data.user.user_id)
            }
        }
        fetchLoginStatus()
    },[])
    
    //save the translated data to the db (modified for image)
    const save_translation = async () => {
        let picture_key = ""
        if(selectedFile != null){ //image was uploaded
            const formData = new FormData()
            formData.append("flash_image", selectedFile)
            //since there is an image, try to get the url
            try{
                picture_key = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/uploadImg`, formData)
                picture_key = picture_key.data
                console.log(picture_key)
            }
            catch{
                //nothing 
                console.log("No image url")
            }
        }
        else{
            console.log("No selected image value")
        }
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/translate`, {
            method: "POST",
            headers: {
                    "Content-Type": "application/json",
                },
                //if there is no image, keep the url value as null
                body: JSON.stringify({
                    input_text: entryText,
                    input_language: entryLanguage,
                    output_language: outputLanguage,
                    output_text: outputText,
                    user_id: userid,
                    picture_key : picture_key
                }),
            });

            const data = await res.json();
            console.log(data);

        } catch (err) {
            console.error(err);
        }
    };

    //set image value 
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0])
        console.log("Selected a file")
    }



    useEffect(() => {
    if (!entryText || !entryLanguage || !outputLanguage) {
        return;
    }

    const translate = async () => {
        try {
            console.log({
            entryText,
            entryLanguage,
            outputLanguage,
        });
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/translateinto`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    input_text: entryText,
                    input_language: entryLanguage,
                    output_language: outputLanguage,
                }),
            });

            const data = await res.json();
            setOutputText(data.output_text);
        } catch (err) {
            console.error(err);
        }
    };

    translate();
}, [entryText, entryLanguage, outputLanguage]);

  return(
    <div className="flex justify-center py-10 px-4 font-[Figtree]">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-semibold text-gray-800">Translator</h1>
          <p className="text-sm text-gray-500 mt-1">Translate what you actually use, then save it as a flashcard</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
          <select value={entryLanguage} onChange={(e) => setEntryLanguage(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500" defaultValue="Select Entry Language">
            <option value="">Select Entry Language</option>
            <option value="EN">English</option>
            <option value="FR">French</option>
            <option value="ES">Spanish</option>
          </select>

          <button type="button" onClick={save_translation} className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg px-4 py-2 transition-colors whitespace-nowrap cursor-pointer">Add to flashcards</button>

          <select value={outputLanguage} onChange={(e) => setOutputLanguage(e.target.value)} id="output-language" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500" defaultValue="Select Translated Language">
            <option value=""> Select Translated Language </option>
            <option value="EN">English</option>
            <option value="FR">French</option>
            <option value="ES">Spanish</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <textarea value={entryText} onChange={(e) => setEntryText(e.target.value)} id="translation-entry" className="flex-1 h-64 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none" placeholder="Enter here:"></textarea>
          <textarea value={outputText} readOnly className="flex-1 h-64 border border-gray-300 rounded-lg p-3 bg-gray-50 resize-none" placeholder="Translation:"></textarea>
        </div>

        {/* add image (optional) */}
        <div className="flex flex-col gap-1">
          <label htmlFor="flashcard-image" className="text-sm font-medium text-gray-700">Flashcard image (optional)</label>
          <div className="flex items-center gap-3">
            <label htmlFor="flashcard-image" className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg px-4 py-2 transition-colors text-sm cursor-pointer whitespace-nowrap">
              Upload flashcard image
            </label>
            <input id="flashcard-image" type="file" accept="image/*" onChange={(e) => handleFileChange(e)} className="hidden"/>
            <span className="text-sm text-gray-500 truncate">{selectedFile ? selectedFile.name : "No image selected"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Translator
