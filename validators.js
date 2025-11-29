const Validators={validateUsername(username){if(!username||typeof username!=='string'){return!1}
return/^[a-zA-Z0-9_-]{2,50}$/.test(username)},validateRoomId(roomId){if(!roomId||typeof roomId!=='string'){return!1}
return/^[a-zA-Z0-9_-]{1,100}$/.test(roomId)},validateMessageLength(message,maxLength=500){if(!message)return!0;return message.length<=maxLength},validateImageFile(file,maxSize=5*1024*1024){if(!file)return{valid:!1,error:'No file provided'};const allowedTypes=['image/jpeg','image/png','image/gif','image/webp'];if(!allowedTypes.includes(file.type)){return{valid:!1,error:'Only image files (JPEG, PNG, GIF, WebP) are allowed'}}
if(file.size>maxSize){return{valid:!1,error:`File size exceeds limit (${maxSize / 1024 / 1024}MB)`}}
return{valid:!0}},sanitizeInput(input,maxLength=500){if(!input||typeof input!=='string'){return''}
return input.trim().substring(0,maxLength)},sanitizeHTML(input){const div=document.createElement('div');div.textContent=input;return div.innerHTML},validateEmail(email){if(!email||typeof email!=='string'){return!1}
const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;return emailRegex.test(email)},validateURL(url){try{new URL(url);return!0}catch(e){return!1}},getErrorMessage(field,value){switch(field){case 'username':if(!value)return'Username is required';if(value.length<2)return'Username must be at least 2 characters';if(value.length>50)return'Username must be less than 50 characters';if(!/^[a-zA-Z0-9_-]+$/.test(value)){return'Username can only contain letters, numbers, underscores, and hyphens'}
return'Invalid username format';case 'roomId':if(!value)return'Room ID is required';if(value.length<1)return'Room ID must be at least 1 character';if(value.length>100)return'Room ID must be less than 100 characters';if(!/^[a-zA-Z0-9_-]+$/.test(value)){return'Room ID can only contain letters, numbers, underscores, and hyphens'}
return'Invalid room ID format';case 'message':if(value&&value.length>500){return'Message is too long (max 500 characters)'}
return'Invalid message';default:return'Invalid input'}}};if(typeof module!=="undefined"){module.exports=Validators}
if(typeof window!=="undefined"){window.Validators=Validators}
