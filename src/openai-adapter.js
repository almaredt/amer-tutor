// Compatibility adapter: preserves the existing tutor's message/tool shape.
class OpenAIAdapter {
 constructor(opts){this.key=opts.apiKey;this.messages={create:this.create.bind(this)};}
 async create(params){
  const messages=params.messages.map(m=>({role:m.role,content:typeof m.content==='string'?m.content:m.content.map(p=>p.type==='image'?{type:'image_url',image_url:{url:'data:'+p.source.media_type+';base64,'+p.source.data}}:{type:'text',text:p.text})}));
  const body={model:params.model,messages,max_completion_tokens:params.max_tokens};
  if(params.tools){body.tools=params.tools.map(t=>({type:'function',function:{name:t.name,description:t.description,parameters:t.input_schema}}));body.tool_choice='auto';}
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),90000);
  let response;
  try{response=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+this.key},body:JSON.stringify(body),signal:controller.signal});}
  finally{clearTimeout(timer);}
  const data=await response.json();
  if(!response.ok){const error=new Error(data.error?.message||'OpenAI request failed');error.status=response.status;throw error;}
  const msg=data.choices?.[0]?.message||{},content=[];
  for(const t of msg.tool_calls||[]){if(t.type==='function'){let input={};try{input=JSON.parse(t.function.arguments);}catch(e){}content.push({type:'tool_use',input});}}
  if(msg.content)content.push({type:'text',text:msg.content});
  return {content,usage:{input_tokens:data.usage?.prompt_tokens||0,output_tokens:data.usage?.completion_tokens||0}};
 }
}
module.exports={OpenAIAdapter};
