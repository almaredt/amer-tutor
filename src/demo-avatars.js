// Stylized vector demo portraits. No external image service or personal photos.
const palette={
 aisyah:['#e8f3ff','#245fbb','#f3b58e','hijab'],daniel:['#f1efff','#263c63','#e4aa82','glasses'],kavitha:['#fceef4','#2d344c','#bf805e','long'],jason:['#fff2d9','#26384e','#e9b08b','short'],farah:['#ffebf2','#bd688e','#e9b28f','hijab'],amir:['#eaf7f4','#30405c','#b97d58','short'],
 sara:['#fceef4','#865a9d','#e9ad87','long'],omar:['#e8f4ff','#334766','#bc8462','short'],lina:['#e9f7f0','#273b57','#e3ad89','long'],
 amer:['#e9f2ff','#2f5fb8','#d9a27c','short'],ali:['#f2eaff','#354a73','#dba680','short'],noor:['#ffedf2','#bb6894','#edb48e','hijab'],adam:['#e5f4ff','#345a75','#bd855f','short'],maya:['#f4eaff','#394a5d','#e4b08b','long'],leo:['#eaf9e7','#2d5161','#d4a17d','glasses']
};
function svg(name){
 const p=palette[name];if(!p)return null;
 const [bg,hair,skin,style]=p;
 const hijab=style==='hijab',long=style==='long',glasses=style==='glasses';
 const back=hijab?`<path d="M53 155Q32 128 42 79Q50 22 101 26Q151 22 160 79Q171 127 146 157Z" fill="${hair}"/>`:long?`<path d="M53 151Q36 120 43 79Q48 26 101 28Q151 26 159 79Q165 121 149 153Z" fill="${hair}"/>`:'';
 const front=hijab?`<path d="M54 98Q43 44 98 38Q149 40 148 98Q138 75 126 58Q94 85 55 89Z" fill="${hair}"/><path d="M51 117Q53 151 37 181L72 181Q83 158 80 139Z" fill="${hair}"/><path d="M149 117Q149 151 165 181L130 181Q119 158 122 139Z" fill="${hair}"/>`:`<path d="M53 90Q44 42 84 35Q108 22 137 42Q160 57 148 89Q139 67 122 60Q93 76 56 75Z" fill="${hair}"/>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 200 200" role="img" aria-label="Illustrated sample avatar"><rect width="200" height="200" fill="${bg}"/><circle cx="157" cy="43" r="24" fill="#ffffff" opacity=".5"/><path d="M9 200Q19 149 62 143L83 133H117L139 143Q183 149 191 200Z" fill="#2f5fb8" stroke="#14243e" stroke-width="3"/>${back}<path d="M82 126V150Q100 164 118 150V126Z" fill="${skin}" stroke="#563d37" stroke-width="2"/><ellipse cx="100" cy="91" rx="48" ry="57" fill="${skin}" stroke="#563d37" stroke-width="2.5"/>${front}<path d="M68 92Q78 85 89 91M110 91Q121 85 132 92" stroke="#332b31" stroke-width="3" stroke-linecap="round" fill="none"/><ellipse cx="80" cy="100" rx="3.5" ry="4.5" fill="#1c2739"/><ellipse cx="120" cy="100" rx="3.5" ry="4.5" fill="#1c2739"/><path d="M100 105L97 119L103 120" stroke="#9b6250" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M87 132Q100 142 113 132" stroke="#8b4c52" stroke-width="3" fill="none" stroke-linecap="round"/>${glasses?'<rect x="64" y="89" width="32" height="23" rx="6" fill="none" stroke="#152a3b" stroke-width="3"/><rect x="104" y="89" width="32" height="23" rx="6" fill="none" stroke="#152a3b" stroke-width="3"/><path d="M96 97H104" stroke="#152a3b" stroke-width="3"/>':''}<path d="M79 149L100 170L121 149" stroke="#fff" stroke-width="4" fill="none"/><path d="M8 192H192" stroke="#17283d" stroke-width="3"/></svg>`;
}
module.exports={svg};
