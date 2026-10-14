export function onclose(){
    console.log("termial session closed");
    
    return{
        msg :"Terminal session will automatically be terminated as the websocket disconnect"
    }
}