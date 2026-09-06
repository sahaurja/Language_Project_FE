import { useNavigate } from "react-router-dom"
import {useState, useEffect} from "react"
import axios from "axios"
import SmallFlashcard from "../components/SmallFlashcard"
 
export default function FlashcardView(){

    const [userId, setUserId] = useState(null)
    
    //store all of the user's flashcards 
    const [allCards, setAllCards] = useState([])

    const navigate = useNavigate()

    //for use with deployment
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    //check if alr logged in, else redirect 
    useEffect(() => {
        async function fetchLoginStatus(){
            const login_res = await axios.get(`${BACKEND_URL}/verifyUser`, { withCredentials: true })
            // const login_res = await axios.get("http://localhost:8081/verifyUser", {withCredentials:true})
            // console.log(login_res.data.success)
            console.log(login_res.data)
            if(!login_res.data.success){
                navigate("/login")
            }
            else{
                console.log(`id: ${login_res.data.user.user_id}`)
                //store user identity 
                setUserId(login_res.data.user.user_id)
            }
        }
        fetchLoginStatus()
    },[])

    //get all the card values given the id 
    useEffect( () => {
        async function fetchAllCards(){
            if(userId != null){
                console.log("fetching cards")
                const res = await axios.post(`${BACKEND_URL}/fetchCards`,{
                    id_val : userId
                })
                setAllCards(res.data)
            }
        }
        fetchAllCards()
    }, [userId])

    return(
        <div className="flex justify-center py-10 px-4 font-[Figtree]">
            <div className="w-full max-w-2xl flex flex-col gap-6">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-gray-800">Your Flashcards</h1>
                    <p className="text-sm text-gray-500 mt-1">All your cards in one place</p>
                </div>

                {allCards.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md p-6 text-center text-gray-500">No flashcards yet</div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {allCards.map(card =>
                            <SmallFlashcard key={card.translator_id} translator_id={card.translator_id} input_text={card.input_text} picture_key={card.picture_key} output_text={card.output_text}/>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}