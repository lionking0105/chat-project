import React, {useEffect, useRef, useState} from 'react';
import {useAuth} from "../hooks/userContext";
import {BASE_WS_URL, getMessages} from "../fetcher";
import MessageComponent from "./message";

const MessagesContent = () => {
    const { contactClicked, user, setContactClicked } = useAuth()
    const [messages, setMessages] = useState([]);
    const [textValue, setTextValue] = useState("");
    const [websocket, setWebsocket] = useState(null);
    const divRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.which === 13) {
                // Handle Enter key press
                // You can call the function or perform the desired action here
                document.querySelector('.submit').click();
            } else if (e.which === 27) {
                // Handle Escape key press
                // You can call the function or perform the desired action here
                setContactClicked({isContactClicked: false})
            }
        };
        divRef.current.scrollIntoView({ behavior: 'smooth' });
        const ws = new WebSocket(BASE_WS_URL + `${contactClicked.roomId.toString()}/`)
        ws.onopen = function (e) {
            console.log('Opened successfully ', e)
            console.log("The connection was setup successfully !");
        }

        ws.onclose = function (e) {
            console.log("Error: ", e)
            console.log("Chat socket closed unexpectedly")
        }

        setWebsocket(ws);
        const fetchMessages = async () => {
            return await getMessages(contactClicked.roomId, {method: 'GET', credentials: 'include'});
        }
        fetchMessages().then(res => setMessages(res.data['data']))

        ws.onmessage = function (e) {
            const data = JSON.parse(e.data);
            console.log(data)
            setMessages(prevState => ([
                ...prevState,
                {
                    content: data['message'],
                    sender: data['sender_username']
                }
            ]))
            setTextValue('')
        }
        window.addEventListener('keydown', handleKeyDown);

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            ws.close()
        }
    }, [contactClicked.roomId])

    const handleChange = (event) => {
        setTextValue(event.target.value)
    }

    const handleMessageSubmit = () => {
        if (textValue === '') return
        websocket.send(JSON.stringify({
            "message": textValue,
            "room_id": contactClicked.roomId,
            "sender_username": user.username
        }));
    }

    const renderMessages = () => {
        if (messages)
            return messages.map((m, i) => {
                return <MessageComponent key={i} msg={m}/>;
            })
    }


    return (
        <>
            <div className="content">
                <div className="contact-profile">
                    <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                    <p>{contactClicked.secondUser}</p>
                </div>
                <div className="messages" ref={divRef}>
                    <ul>
                        {renderMessages()}
                    </ul>
                </div>
                <div className="message-input">
                    <div className="wrap">
                        <input type="text" placeholder="Write your message..." value={textValue} onChange={handleChange} />
                        <i className="fa fa-paperclip attachment" aria-hidden="true"></i>
                        <button className="submit" onClick={handleMessageSubmit}>
                            <i className="fa fa-paper-plane" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MessagesContent;
