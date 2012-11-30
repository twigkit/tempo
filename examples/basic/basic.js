var data = [
    {'name':{'first':'Leonard', 'last':'Marx'}, 'nickname':'Chico', 'born':'March 21, 1887', 'actor':true, 'solo_endeavours':[
        {'title':'Papa Romani'}
    ]},
    {'name':{'first':'Adolph', 'last':'Marx'}, 'nickname':'Harpo', 'born':'November 23, 1888', 'actor':true, 'solo_endeavours':[
        {'title':'Too Many Kisses', 'rating':'favourite'},
        {'title':'Stage Door Canteen'}
    ]},
    {'name':{'first':'Julius Henry', 'last':'Marx'}, 'nickname':'Groucho', 'born':'October 2, 1890', 'actor':true, 'solo_endeavours':[
        {'title':'Copacabana'},
        {'title':'Mr. Music', 'rating':'favourite'},
        {'title':'Double Dynamite'}
    ]},
    {'name':{'first':'Milton', 'last':'Marx'}, 'nickname':'Gummo', 'born':'October 23, 1892'},
    {'name':{'first':'Herbert', 'last':'Marx'}, 'nickname':'Zeppo', 'born':'February 25, 1901', 'actor':true, 'solo_endeavours':[
        {'title':'A Kiss in the Dark'}
    ]}
];

// Render
Tempo.prepare('marx-brothers').render(data);