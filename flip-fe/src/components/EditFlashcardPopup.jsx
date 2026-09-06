import { useState } from "react"
import axios from "axios"
import "./ProgressPopup.css"

export default function EditFlashcardPopup({translator_id, init_input, init_output, init_pic, onClose}){

    const [selectedFile, setSelectedFile] = useState(null)
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const [flashcardValues, setFlashcardValues] = useState({
        input_text: init_input,
        output_text: init_output
    })

    const handleFormChange = (e) => {
        setFlashcardValues(
            {
                ...flashcardValues,
                [e.target.name] : e.target.value
            }
        )
    }

    //set image value 
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0])
        console.log("Selected a file")
    }

    //submit the form to edit the data 
    const handleFormSubmit = async(e) => {
        e.preventDefault()
        let picture_key = init_pic
        //get the picture key if picture was uplaoded 
        if(selectedFile != null){
            const formData = new FormData()
            formData.append("flash_image", selectedFile)
            //since there is an image, try to get the url
            try{
                picture_key = await axios.post(`${BACKEND_URL}/uploadImg`, formData)
                picture_key = picture_key.data
                console.log(picture_key)
            }
            catch{
                //nothing 
                console.log("No image url")
            }
        }
        try{
            //update request
            const res = await axios.put(`${BACKEND_URL}/updateFlashcard`, {
            translator_id:translator_id,
            input_text:flashcardValues.input_text,
            output_text:flashcardValues.output_text,
            pic_key:picture_key
            })
            if(onClose) onClose()
        }
        catch (err){
            console.log(err)
        }

    }

    return(
        <>
            <div className="modal" id="modal">
                <div className="modal-header">
                    <div className="title">Edit Flashcard</div>
                    <button type="button" className="close-button" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <form className="flex flex-col gap-3 font-[Figtree]" onSubmit={(e) => handleFormSubmit(e)}>
                        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                            Input text
                            <input type="text" name="input_text" placeholder="input text" className="border border-gray-300 rounded-lg px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-yellow-500" value={flashcardValues.input_text} onChange={(e) => handleFormChange(e)}/>
                        </label>

                        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                            Output text
                            <input type="text" name="output_text" placeholder="output text" className="border border-gray-300 rounded-lg px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-yellow-500" value={flashcardValues.output_text} onChange={(e) => handleFormChange(e)}/>
                        </label>

                        <input type="file" onChange={(e) => handleFileChange(e)} className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 file:font-medium hover:file:bg-gray-200 file:cursor-pointer cursor-pointer"/>

                        <input type="submit" value="Save changes" className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg px-4 py-2 transition-colors cursor-pointer"/>
                    </form>
                </div>
            </div>

            <div id="overlay" className="active" onClick={onClose}></div>
        </>
    )
}