/**
 * phraseBank.js
 * -----------------------------------------------------------------------
 * Frases completas, reales y gramaticalmente correctas para cada tema del
 * plan, en los 3 idiomas. Esto es lo que convierte cada sesion en algo
 * conversacional de verdad (no solo palabras sueltas): cada dia el
 * estudiante practica frases que podria usar con un hablante nativo.
 *
 * Formato de cada entrada: [frase en el idioma meta, pronunciacion
 * (pinyin/romanizacion, vacio en ingles), traduccion al espanol].
 * -----------------------------------------------------------------------
 */

const RAW = {
  en: {
    'Saludos y primer contacto': [
      ['Hi, how are you?', '', 'Hola, como estas?'],
      ['Nice to meet you.', '', 'Mucho gusto.'],
      ['See you tomorrow!', '', 'Nos vemos manana!'],
      ['Long time no see.', '', 'Cuanto tiempo sin verte.'],
    ],
    'Presentarte a ti mismo': [
      ['My name is Carlos and I am from Bolivia.', '', 'Me llamo Carlos y soy de Bolivia.'],
      ['I am 25 years old.', '', 'Tengo 25 anios.'],
      ['I work as a designer.', '', 'Trabajo como disenador.'],
      ['What do you do for a living?', '', 'A que te dedicas?'],
    ],
    'Numeros y datos personales': [
      ['My phone number is 555-2301.', '', 'Mi numero de telefono es 555-2301.'],
      ['I was born in 1998.', '', 'Naci en 1998.'],
      ['Can I get your email address?', '', 'Me das tu correo electronico?'],
      ['There are four people in my family.', '', 'Somos cuatro en mi familia.'],
    ],
    'Colores y descripciones simples': [
      ['I like the blue one better.', '', 'Me gusta mas el azul.'],
      ['She has short black hair.', '', 'Ella tiene el pelo negro y corto.'],
      ['This shirt is too bright for me.', '', 'Esta camisa es demasiado llamativa para mi.'],
      ['What color do you prefer?', '', 'Que color prefieres?'],
    ],
    'Tu rutina diaria y el tiempo': [
      ['I usually wake up at seven.', '', 'Normalmente me despierto a las siete.'],
      ['What time do you get off work?', '', 'A que hora sales del trabajo?'],
      ['I need more time to finish this.', '', 'Necesito mas tiempo para terminar esto.'],
      ["Let's meet at noon.", '', 'Nos vemos al mediodia.'],
    ],
    'Tu familia': [
      ['I have two siblings.', '', 'Tengo dos hermanos.'],
      ['My parents live in another city.', '', 'Mis padres viven en otra ciudad.'],
      ['Do you have any kids?', '', 'Tienes hijos?'],
      ['My grandmother is turning eighty.', '', 'Mi abuela va a cumplir ochenta anios.'],
    ],
    'La casa': [
      ['Make yourself at home.', '', 'Sientete como en tu casa.'],
      ['Where is the bathroom?', '', 'Donde esta el bano?'],
      ['I need to clean my room.', '', 'Necesito limpiar mi cuarto.'],
      ['We just moved into a new apartment.', '', 'Recien nos mudamos a un apartamento nuevo.'],
    ],
    'Comida y bebidas': [
      ['Can I get the menu, please?', '', 'Me trae el menu, por favor?'],
      ["I'm allergic to peanuts.", '', 'Soy alergico al mani.'],
      ['This is delicious!', '', 'Esto esta delicioso!'],
      ['Could I have a glass of water?', '', 'Me puede traer un vaso de agua?'],
    ],
    'Animales': [
      ['Do you have any pets?', '', 'Tienes mascotas?'],
      ['My dog loves going for walks.', '', 'A mi perro le encanta salir a caminar.'],
      ['Be careful, that dog might bite.', '', 'Ten cuidado, ese perro podria morder.'],
      ["I'm more of a cat person.", '', 'Soy mas de gatos.'],
    ],
    'El clima': [
      ["It looks like it's going to rain.", '', 'Parece que va a llover.'],
      ["It's freezing outside today.", '', 'Hoy hace un frio tremendo afuera.'],
      ["Don't forget your umbrella.", '', 'No olvides tu paraguas.'],
      ['I love sunny days.', '', 'Me encantan los dias soleados.'],
    ],
    'Ropa': [
      ['Do you have this in a smaller size?', '', 'Tienen esto en una talla mas pequenia?'],
      ['I need something for a job interview.', '', 'Necesito algo para una entrevista de trabajo.'],
      ['These shoes are really comfortable.', '', 'Estos zapatos son muy comodos.'],
      ['Can I try this on?', '', 'Puedo probarme esto?'],
    ],
    'La ciudad y el transporte': [
      ['How do I get to the train station?', '', 'Como llego a la estacion de tren?'],
      ['Is this seat taken?', '', 'Esta ocupado este asiento?'],
      ['I always get stuck in traffic.', '', 'Siempre me quedo atrapado en el trafico.'],
      ["Let's take a taxi, it's faster.", '', 'Tomemos un taxi, es mas rapido.'],
    ],
    'De compras': [
      ['How much does this cost?', '', 'Cuanto cuesta esto?'],
      ['Do you accept credit cards?', '', 'Aceptan tarjeta de credito?'],
      ["That's too expensive for me.", '', 'Eso es muy caro para mi.'],
      ['Is there a discount for this?', '', 'Hay descuento en esto?'],
    ],
    'La universidad y el estudio': [
      ['I have an exam next week.', '', 'Tengo un examen la proxima semana.'],
      ['Could you explain that again?', '', 'Podrias explicar eso otra vez?'],
      ['I study computer science.', '', 'Estudio ciencias de la computacion.'],
      ['I need to submit this assignment by Friday.', '', 'Tengo que entregar esta tarea el viernes.'],
    ],
    'El trabajo': [
      ['I have a meeting at three.', '', 'Tengo una reunion a las tres.'],
      ['Can we reschedule for tomorrow?', '', 'Podemos reprogramarlo para manana?'],
      ["I'm really busy this week.", '', 'Estoy muy ocupado esta semana.'],
      ['I just got a new job offer.', '', 'Me acaban de ofrecer un nuevo trabajo.'],
    ],
    'Viajes y aeropuertos': [
      ['Where is my gate?', '', 'Donde esta mi puerta de embarque?'],
      ["I'd like to check in for my flight.", '', 'Quisiera hacer el check-in de mi vuelo.'],
      ['My flight got delayed.', '', 'Mi vuelo se retraso.'],
      ['Do you have any recommendations for tourists?', '', 'Tienes recomendaciones para turistas?'],
    ],
    'Salud y el cuerpo humano': [
      ['I have a headache.', '', 'Me duele la cabeza.'],
      ['I need to see a doctor.', '', 'Necesito ver a un doctor.'],
      ["I haven't been feeling well lately.", '', 'No me he sentido bien ultimamente.'],
      ['Take this medicine twice a day.', '', 'Toma esta medicina dos veces al dia.'],
    ],
    'Sentimientos y emociones': [
      ["I'm really excited about this trip.", '', 'Estoy muy emocionado por este viaje.'],
      ['I feel a bit stressed today.', '', 'Me siento un poco estresado hoy.'],
      ["Don't worry, everything will be fine.", '', 'No te preocupes, todo va a estar bien.'],
      ["I'm so proud of you.", '', 'Estoy muy orgulloso de ti.'],
    ],
    'La naturaleza': [
      ["Let's go hiking this weekend.", '', 'Vayamos de excursion este fin de semana.'],
      ['The view from here is amazing.', '', 'La vista desde aqui es increible.'],
      ['We should recycle more.', '', 'Deberiamos reciclar mas.'],
      ['I love camping under the stars.', '', 'Me encanta acampar bajo las estrellas.'],
    ],
    'Emergencias': [
      ['Call an ambulance!', '', 'Llama a una ambulancia!'],
      ['I need help right now.', '', 'Necesito ayuda ahora mismo.'],
      ["There's been an accident.", '', 'Hubo un accidente.'],
      ['Where is the nearest hospital?', '', 'Donde esta el hospital mas cercano?'],
    ],
    'Deportes': [
      ['Do you want to play soccer this weekend?', '', 'Quieres jugar futbol este fin de semana?'],
      ['I go to the gym three times a week.', '', 'Voy al gimnasio tres veces por semana.'],
      ['Which team are you rooting for?', '', 'A que equipo le vas?'],
      ['I need to start exercising more.', '', 'Necesito empezar a hacer mas ejercicio.'],
    ],
    'Tecnologia': [
      ['My phone battery died.', '', 'Se me acabo la bateria del celular.'],
      ['Can you send me the file?', '', 'Me puedes enviar el archivo?'],
      ['This app keeps crashing.', '', 'Esta aplicacion se sigue cerrando sola.'],
      ['I need to update my software.', '', 'Necesito actualizar mi software.'],
    ],
    'Computadoras y programacion': [
      ["I'm learning how to code.", '', 'Estoy aprendiendo a programar.'],
      ["There's a bug in this line of code.", '', 'Hay un error en esta linea de codigo.'],
      ['Can you review my project?', '', 'Puedes revisar mi proyecto?'],
      ['I need to install this program.', '', 'Necesito instalar este programa.'],
    ],
    'Internet y redes sociales': [
      ['Did you see that video I sent you?', '', 'Viste el video que te mande?'],
      ["I'll message you later.", '', 'Te escribo un mensaje despues.'],
      ['My internet connection is really slow.', '', 'Mi conexion a internet esta muy lenta.'],
      ["Let's do a video call tonight.", '', 'Hagamos una videollamada esta noche.'],
    ],
    'Inteligencia artificial': [
      ['AI is changing the way we work.', '', 'La inteligencia artificial esta cambiando como trabajamos.'],
      ['I used an AI tool to help me study.', '', 'Use una herramienta de IA para ayudarme a estudiar.'],
      ['Do you think AI will replace jobs?', '', 'Crees que la IA reemplazara empleos?'],
      ['This chatbot understands context really well.', '', 'Este chatbot entiende muy bien el contexto.'],
    ],
    'Videojuegos': [
      ['Do you want to play a game with me?', '', 'Quieres jugar un videojuego conmigo?'],
      ['I just beat the final boss!', '', 'Acabo de vencer al jefe final!'],
      ["What's your favorite game?", '', 'Cual es tu videojuego favorito?'],
      ["Let's team up in the next round.", '', 'Hagamos equipo en la proxima ronda.'],
    ],
    'Musica': [
      ['What kind of music do you like?', '', 'Que tipo de musica te gusta?'],
      ['This song is stuck in my head.', '', 'Esta cancion se me quedo pegada en la cabeza.'],
      ['Do you play any instruments?', '', 'Tocas algun instrumento?'],
      ["Let's go to a concert together.", '', 'Vayamos juntos a un concierto.'],
    ],
    'Peliculas': [
      ['Have you seen this movie yet?', '', 'Ya viste esta pelicula?'],
      ["What's your favorite genre?", '', 'Cual es tu genero favorito?'],
      ['The ending surprised me a lot.', '', 'El final me sorprendio mucho.'],
      ["Let's watch something tonight.", '', 'Veamos algo esta noche.'],
    ],
    'Negocios': [
      ['We need to close this deal by Friday.', '', 'Necesitamos cerrar este trato antes del viernes.'],
      ["Let's schedule a meeting with the client.", '', 'Programemos una reunion con el cliente.'],
      ['Our sales grew this quarter.', '', 'Nuestras ventas crecieron este trimestre.'],
      ["I'd like to propose a new idea.", '', 'Me gustaria proponer una nueva idea.'],
    ],
  },
  ko: {
    'Saludos y primer contacto': [
      ['annyeonghaseyo, jal jinaeyo?', '', 'Hola, como estas?'],
      ['mannaseo bangawoyo', '', 'Mucho gusto.'],
      ['naeil bwayo!', '', 'Nos vemos manana!'],
      ['oraenmanieyo', '', 'Cuanto tiempo sin verte.'],
    ],
    'Presentarte a ti mismo': [
      ['je ireumeun Carlos-igo Bolivia-eseo wasseoyo', '', 'Me llamo Carlos y soy de Bolivia.'],
      ['jeoneun seumuldaseot sarieyo', '', 'Tengo veinticinco anios.'],
      ['jeoneun dijaineoro ilhaeyo', '', 'Trabajo como disenador.'],
      ['museun ireul haseyo?', '', 'A que te dedicas?'],
    ],
    'Numeros y datos personales': [
      ['je jeonhwabeonhoneun 555-2301ieyo', '', 'Mi numero de telefono es 555-2301.'],
      ['jeoneun 1998nyeone taeeonasseoyo', '', 'Naci en 1998.'],
      ['imeil jusoreul allyeojuseyo', '', 'Dame tu correo electronico.'],
      ['jeohui gajogeun ne myeongieyo', '', 'Somos cuatro en mi familia.'],
    ],
    'Colores y descripciones simples': [
      ['jeoneun paransaegi deo joayo', '', 'Me gusta mas el azul.'],
      ['geunyeoneun jjalbeun geomeun meoriyeyo', '', 'Ella tiene el pelo negro y corto.'],
      ['i syeocheuneun jeohante neomu hwaryeohaeyo', '', 'Esta camisa es demasiado llamativa para mi.'],
      ['eotteon saegeul joahaeyo?', '', 'Que color prefieres?'],
    ],
    'Tu rutina diaria y el tiempo': [
      ['jeoneun botong ilgop sie ireonayo', '', 'Normalmente me despierto a las siete.'],
      ['myeot sie toegeunhaeyo?', '', 'A que hora sales del trabajo?'],
      ['sigani deo pillyohaeyo', '', 'Necesito mas tiempo.'],
      ['jeongoe mannayo', '', 'Nos vemos al mediodia.'],
    ],
    'Tu familia': [
      ['jeoneun hyeongjega du myeong isseoyo', '', 'Tengo dos hermanos.'],
      ['bumonimeun dareun dosie saseyo', '', 'Mis padres viven en otra ciudad.'],
      ['aiga isseoyo?', '', 'Tienes hijos?'],
      ['halmeoniga got yeodeun sari doeseyo', '', 'Mi abuela va a cumplir ochenta anios.'],
    ],
    'La casa': [
      ['pyeonhage gyeseyo', '', 'Sientete como en tu casa.'],
      ['hwajangsiri eodiyeyo?', '', 'Donde esta el bano?'],
      ['je bangeul cheongsohaeya haeyo', '', 'Necesito limpiar mi cuarto.'],
      ['jeohuineun sae apateuro isahaesseoyo', '', 'Nos mudamos a un apartamento nuevo.'],
    ],
    'Comida y bebidas': [
      ['menyu jom juseyo', '', 'El menu, por favor.'],
      ['jeoneun ttangkong allereugiga isseoyo', '', 'Soy alergico al mani.'],
      ['igeo jeongmal masisseoyo!', '', 'Esto esta delicioso!'],
      ['mul han jan juseyo', '', 'Un vaso de agua, por favor.'],
    ],
    'Animales': [
      ['ballyeodongmuri isseoyo?', '', 'Tienes mascotas?'],
      ['je gangajineun sanchaegeul joahaeyo', '', 'A mi perro le encanta pasear.'],
      ['josimhaseyo, geu gaega mul su isseoyo', '', 'Ten cuidado, ese perro podria morder.'],
      ['jeoneun goyangireul deo joahaeyo', '', 'Prefiero los gatos.'],
    ],
    'El clima': [
      ['biga ol geot gatayo', '', 'Parece que va a llover.'],
      ['oneul neomu chuwoyo', '', 'Hoy hace mucho frio.'],
      ['usaneul itji maseyo', '', 'No olvides el paraguas.'],
      ['jeoneun malgeun nareul joahaeyo', '', 'Me gustan los dias soleados.'],
    ],
    'Ropa': [
      ['deo jageun saijeu isseoyo?', '', 'Tienen una talla mas pequenia?'],
      ['myeonjeobe ibeul osi pillyohaeyo', '', 'Necesito ropa para una entrevista.'],
      ['i sinbareun jeongmal pyeonhaeyo', '', 'Estos zapatos son muy comodos.'],
      ['igeo ibeobwado dwaeyo?', '', 'Puedo probarme esto?'],
    ],
    'La ciudad y el transporte': [
      ['gichayeoge eotteoke gayo?', '', 'Como llego a la estacion de tren?'],
      ['i jari bieo isseoyo?', '', 'Esta libre este asiento?'],
      ['hangsang giri makhyeoyo', '', 'Siempre hay trafico.'],
      ['taeksi taneun ge deo ppallayo', '', 'Es mas rapido tomar un taxi.'],
    ],
    'De compras': [
      ['igeo eolmayeyo?', '', 'Cuanto cuesta esto?'],
      ['kadeu dwaeyo?', '', 'Aceptan tarjeta?'],
      ['neomu bissayo', '', 'Es muy caro.'],
      ['harin isseoyo?', '', 'Hay descuento?'],
    ],
    'La universidad y el estudio': [
      ['daeum jue siheomi isseoyo', '', 'Tengo un examen la proxima semana.'],
      ['dasi seolmyeonghae jusigesseoyo?', '', 'Podrias explicar eso otra vez?'],
      ['jeoneun keompyuteogonghageul gongbuhaeyo', '', 'Estudio ciencias de la computacion.'],
      ['geumyoilkkaji gwajereul naeya haeyo', '', 'Debo entregar la tarea el viernes.'],
    ],
    'El trabajo': [
      ['se sie hoeuiga isseoyo', '', 'Tengo una reunion a las tres.'],
      ['naeillo mirul su isseoyo?', '', 'Podemos reprogramarlo para manana?'],
      ['ibeon jue jeongmal bappayo', '', 'Estoy muy ocupado esta semana.'],
      ['sae iljari jeaneul badasseoyo', '', 'Me ofrecieron un nuevo trabajo.'],
    ],
    'Viajes y aeropuertos': [
      ['je geiteuga eodiyeyo?', '', 'Donde esta mi puerta de embarque?'],
      ['chekeuinhago sipeoyo', '', 'Quisiera hacer el check-in.'],
      ['je bihaenggiga jiyeondwaesseoyo', '', 'Mi vuelo se retraso.'],
      ['chucheonhal manhan gosi isseoyo?', '', 'Tienes algun lugar que recomendar?'],
    ],
    'Salud y el cuerpo humano': [
      ['meoriga apayo', '', 'Me duele la cabeza.'],
      ['byeongwone gaya haeyo', '', 'Necesito ir al hospital.'],
      ['yojeum momi an joayo', '', 'No me he sentido bien ultimamente.'],
      ['harue du beon i yageul deuseyo', '', 'Toma esta medicina dos veces al dia.'],
    ],
    'Sentimientos y emociones': [
      ['ibeon yeohaengi jeongmal gidaedwaeyo', '', 'Estoy muy emocionado por este viaje.'],
      ['oneul jom seuteureseubadayo', '', 'Hoy me siento un poco estresado.'],
      ['geokjeonghaji maseyo, da jaldoel geoyeyo', '', 'No te preocupes, todo va a estar bien.'],
      ['nega jeongmal jarangseureowo', '', 'Estoy muy orgulloso de ti.'],
    ],
    'La naturaleza': [
      ['ibeon jumare deungsan gayo', '', 'Vayamos de excursion este fin de semana.'],
      ['yeogiseo boneun gyeongchiga jeongmal meotjyeoyo', '', 'La vista desde aqui es increible.'],
      ['urineun jaehwallyongeul deo haeya haeyo', '', 'Deberiamos reciclar mas.'],
      ['jeoneun kaempingeul joahaeyo', '', 'Me encanta acampar.'],
    ],
    'Emergencias': [
      ['gugeupchareul bulleojuseyo!', '', 'Llama a una ambulancia!'],
      ['jigeum doumi pillyohaeyo', '', 'Necesito ayuda ahora mismo.'],
      ['sagoga nasseoyo', '', 'Hubo un accidente.'],
      ['gajang gakkaun byeongwoni eodiyeyo?', '', 'Donde esta el hospital mas cercano?'],
    ],
    'Deportes': [
      ['ibeon jumare chukguhallaeyo?', '', 'Quieres jugar futbol este fin de semana?'],
      ['jeoneun iljuire se beon helseujange gayo', '', 'Voy al gimnasio tres veces por semana.'],
      ['eoneu timeul eungwonhaeyo?', '', 'A que equipo apoyas?'],
      ['undongeul deo sijakhaeya haeyo', '', 'Necesito empezar a hacer mas ejercicio.'],
    ],
    'Tecnologia': [
      ['haendeupon baeteoriga nagasseoyo', '', 'Se me acabo la bateria del celular.'],
      ['pail jom bonaejullaeyo?', '', 'Me puedes enviar el archivo?'],
      ['i aebi gyesok meomchwoyo', '', 'Esta app se sigue cerrando.'],
      ['seopeuteuweeoreul eopdeiteuhaeya haeyo', '', 'Necesito actualizar mi software.'],
    ],
    'Computadoras y programacion': [
      ['jeoneun kodingeul baeugo isseoyo', '', 'Estoy aprendiendo a programar.'],
      ['i kodeue oryuga isseoyo', '', 'Hay un error en este codigo.'],
      ['je peurojekteu bwajul su isseoyo?', '', 'Puedes revisar mi proyecto?'],
      ['i peurogeuraemeul seolchihaeya haeyo', '', 'Necesito instalar este programa.'],
    ],
    'Internet y redes sociales': [
      ['jega bonaen yeongsang bwasseoyo?', '', 'Viste el video que te mande?'],
      ['najunge mesiji bonaelgeyo', '', 'Te escribo un mensaje despues.'],
      ['inteoneosi neomu neuryeoyo', '', 'El internet esta muy lento.'],
      ['oneul bame yeongsangtonghwahaeyo', '', 'Hagamos una videollamada esta noche.'],
    ],
    'Inteligencia artificial': [
      ['inggongjineungi ilhaneun bangsigeul bakkugo isseoyo', '', 'La IA esta cambiando como trabajamos.'],
      ['gongbuhal ttae inggongjineung dogureul sseoyo', '', 'Uso una herramienta de IA para estudiar.'],
      ['inggongjineungi jigeobeul daechehalkkayo?', '', 'Crees que la IA reemplazara empleos?'],
      ['i chaesboseun munmaegeul jal ihaehaeyo', '', 'Este chatbot entiende bien el contexto.'],
    ],
    'Videojuegos': [
      ['jerang gachi geimhallaeyo?', '', 'Quieres jugar un videojuego conmigo?'],
      ['banggeum majimak boseureul igyeosseoyo!', '', 'Acabo de vencer al jefe final!'],
      ['jeil joahaneun geimi mwoyeyo?', '', 'Cual es tu videojuego favorito?'],
      ['daeum pane gachi tim haeyo', '', 'Hagamos equipo en la proxima ronda.'],
    ],
    'Musica': [
      ['eotteon eumageul joahaeyo?', '', 'Que tipo de musica te gusta?'],
      ['i noraega meoritsogeseo an tteonayo', '', 'Esta cancion se me quedo pegada.'],
      ['akgi yeonjuhal jul arayo?', '', 'Tocas algun instrumento?'],
      ['gachi konseoteu gayo', '', 'Vayamos juntos a un concierto.'],
    ],
    'Peliculas': [
      ['i yeonghwa bwasseoyo?', '', 'Ya viste esta pelicula?'],
      ['jeil joahaneun jangnega mwoyeyo?', '', 'Cual es tu genero favorito?'],
      ['gyeolmari jeongmal nollawosseoyo', '', 'El final me sorprendio mucho.'],
      ['oneul bame mwo bwayo', '', 'Veamos algo esta noche.'],
    ],
    'Negocios': [
      ['geumyoilkkaji i gyeyageul mamurihaeya haeyo', '', 'Debemos cerrar este trato antes del viernes.'],
      ['gogaekgwa hoeui jabayo', '', 'Programemos una reunion con el cliente.'],
      ['ibeon bungi maechuri neureosseoyo', '', 'Nuestras ventas crecieron este trimestre.'],
      ['saeroun aidieoreul jeanhago sipeoyo', '', 'Me gustaria proponer una nueva idea.'],
    ],
  },
  zh: {
    'Saludos y primer contacto': [
      ['ni hao, ni zuijin zenmeyang?', '', 'Hola, como estas?'],
      ['hen gaoxing renshi ni', '', 'Mucho gusto.'],
      ['mingtian jian!', '', 'Nos vemos manana!'],
      ['haojiu bujian', '', 'Cuanto tiempo sin verte.'],
    ],
    'Presentarte a ti mismo': [
      ['wo jiao Carlos, wo laizi Boliweiya', '', 'Me llamo Carlos y soy de Bolivia.'],
      ['wo jinnian ershiwu sui', '', 'Tengo veinticinco anios.'],
      ['wo shi shejishi', '', 'Soy disenador.'],
      ['ni shi zuo shenme gongzuo de?', '', 'A que te dedicas?'],
    ],
    'Numeros y datos personales': [
      ['wo de dianhua haoma shi 555-2301', '', 'Mi numero de telefono es 555-2301.'],
      ['wo shi 1998 nian chusheng de', '', 'Naci en 1998.'],
      ['keyi gaosu wo ni de youxiang ma?', '', 'Me das tu correo electronico?'],
      ['wo jia you si kou ren', '', 'Somos cuatro en mi familia.'],
    ],
    'Colores y descripciones simples': [
      ['wo geng xihuan lanse', '', 'Me gusta mas el azul.'],
      ['ta you yi tou heise de duanfa', '', 'Ella tiene el pelo negro y corto.'],
      ['zhe jian yifu dui wo laishuo tai xianyan le', '', 'Esta ropa es demasiado llamativa para mi.'],
      ['ni xihuan shenme yanse?', '', 'Que color prefieres?'],
    ],
    'Tu rutina diaria y el tiempo': [
      ['wo yiban qi dian qichuang', '', 'Normalmente me despierto a las siete.'],
      ['ni ji dian xiaban?', '', 'A que hora sales del trabajo?'],
      ['wo xuyao geng duo shijian', '', 'Necesito mas tiempo.'],
      ['women zhongwu jian ba', '', 'Nos vemos al mediodia.'],
    ],
    'Tu familia': [
      ['wo you liang ge xiongdi jiemei', '', 'Tengo dos hermanos.'],
      ['wo fumu zhu zai bie de chengshi', '', 'Mis padres viven en otra ciudad.'],
      ['ni you haizi ma?', '', 'Tienes hijos?'],
      ['wo nainai kuai bashi sui le', '', 'Mi abuela va a cumplir ochenta anios.'],
    ],
    'La casa': [
      ['bie keqi, jiu xiang zai jia yiyang', '', 'Sientete como en tu casa.'],
      ['xishoujian zai nar?', '', 'Donde esta el bano?'],
      ['wo xuyao dasao wo de fangjian', '', 'Necesito limpiar mi cuarto.'],
      ['women gang ban jin xin gongyu', '', 'Nos mudamos a un apartamento nuevo.'],
    ],
    'Comida y bebidas': [
      ['qing gei wo caidan', '', 'El menu, por favor.'],
      ['wo dui huasheng guomin', '', 'Soy alergico al mani.'],
      ['zhege tai haochi le!', '', 'Esto esta delicioso!'],
      ['qing gei wo yi bei shui', '', 'Un vaso de agua, por favor.'],
    ],
    'Animales': [
      ['ni you chongwu ma?', '', 'Tienes mascotas?'],
      ['wo de gou hen xihuan sanbu', '', 'A mi perro le encanta pasear.'],
      ['xiaoxin, na zhi gou keneng hui yao ren', '', 'Ten cuidado, ese perro podria morder.'],
      ['wo geng xihuan mao', '', 'Prefiero los gatos.'],
    ],
    'El clima': [
      ['haoxiang yao xiayu le', '', 'Parece que va a llover.'],
      ['jintian waimian tebie leng', '', 'Hoy hace mucho frio.'],
      ['bie wang le dai san', '', 'No olvides el paraguas.'],
      ['wo xihuan qingtian', '', 'Me gustan los dias soleados.'],
    ],
    'Ropa': [
      ['you geng xiao hao de ma?', '', 'Tienen una talla mas pequenia?'],
      ['wo xuyao mianshi chuan de yifu', '', 'Necesito ropa para una entrevista.'],
      ['zhe shuang xie hen shufu', '', 'Estos zapatos son muy comodos.'],
      ['wo keyi shichuan ma?', '', 'Puedo probarme esto?'],
    ],
    'La ciudad y el transporte': [
      ['huochezhan zenme zou?', '', 'Como llego a la estacion de tren?'],
      ['zhege weizhi youren zuo ma?', '', 'Esta ocupado este asiento?'],
      ['zheli zongshi duche', '', 'Siempre hay trafico aqui.'],
      ['dache geng kuai', '', 'Es mas rapido tomar un taxi.'],
    ],
    'De compras': [
      ['zhege duoshao qian?', '', 'Cuanto cuesta esto?'],
      ['keyi shuaka ma?', '', 'Aceptan tarjeta?'],
      ['tai gui le', '', 'Es muy caro.'],
      ['you dazhe ma?', '', 'Hay descuento?'],
    ],
    'La universidad y el estudio': [
      ['xia zhou wo you kaoshi', '', 'Tengo un examen la proxima semana.'],
      ['ni neng zai jieshi yixia ma?', '', 'Podrias explicar eso otra vez?'],
      ['wo xue jisuanji kexue', '', 'Estudio ciencias de la computacion.'],
      ['wo zhou wu zhiqian yao jiao zuoye', '', 'Debo entregar la tarea el viernes.'],
    ],
    'El trabajo': [
      ['wo san dian you ge huiyi', '', 'Tengo una reunion a las tres.'],
      ['women neng gai dao mingtian ma?', '', 'Podemos reprogramarlo para manana?'],
      ['zhe zhou wo tebie mang', '', 'Estoy muy ocupado esta semana.'],
      ['wo gang shoudao yi ge xin gongzuo jihui', '', 'Me ofrecieron un nuevo trabajo.'],
    ],
    'Viajes y aeropuertos': [
      ['wo de dengjikou zai nar?', '', 'Donde esta mi puerta de embarque?'],
      ['wo xiang banli dengji shouxu', '', 'Quisiera hacer el check-in.'],
      ['wo de hangban yanwu le', '', 'Mi vuelo se retraso.'],
      ['ni you shenme tuijian de difang ma?', '', 'Tienes algun lugar que recomendar?'],
    ],
    'Salud y el cuerpo humano': [
      ['wo touteng', '', 'Me duele la cabeza.'],
      ['wo xuyao qu kan yisheng', '', 'Necesito ir al medico.'],
      ['wo zuijin ganjue bu tai hao', '', 'No me he sentido bien ultimamente.'],
      ['zhege yao yi tian chi liang ci', '', 'Toma esta medicina dos veces al dia.'],
    ],
    'Sentimientos y emociones': [
      ['wo dui zhe ci lvxing hen qidai', '', 'Estoy muy emocionado por este viaje.'],
      ['wo jintian youdianr yali da', '', 'Hoy me siento un poco estresado.'],
      ['bie danxin, yiqie dou hui hao de', '', 'No te preocupes, todo va a estar bien.'],
      ['wo zhen wei ni jiaoao', '', 'Estoy muy orgulloso de ti.'],
    ],
    'La naturaleza': [
      ['women zhe zhoumo qu pashan ba', '', 'Vayamos de excursion este fin de semana.'],
      ['zheli de fengjing tai mei le', '', 'La vista desde aqui es increible.'],
      ['women yinggai duo huishou liyong', '', 'Deberiamos reciclar mas.'],
      ['wo xihuan luying', '', 'Me encanta acampar.'],
    ],
    'Emergencias': [
      ['kuai jiao jiuhuche!', '', 'Llama a una ambulancia!'],
      ['wo xianzai xuyao bangzhu', '', 'Necesito ayuda ahora mismo.'],
      ['fasheng shigu le', '', 'Hubo un accidente.'],
      ['zuijin de yiyuan zai nar?', '', 'Donde esta el hospital mas cercano?'],
    ],
    'Deportes': [
      ['zhoumo yiqi ti zuqiu ba?', '', 'Quieres jugar futbol este fin de semana?'],
      ['wo yi zhou qu san ci jianshenfang', '', 'Voy al gimnasio tres veces por semana.'],
      ['ni zhichi nage dui?', '', 'A que equipo apoyas?'],
      ['wo dei duo yundong le', '', 'Necesito empezar a hacer mas ejercicio.'],
    ],
    'Tecnologia': [
      ['wo de shouji mei dian le', '', 'Se me acabo la bateria del celular.'],
      ['ni neng ba wenjian fa gei wo ma?', '', 'Me puedes enviar el archivo?'],
      ['zhege yingyong yizhi bengkui', '', 'Esta app se sigue cerrando.'],
      ['wo xuyao gengxin ruanjian', '', 'Necesito actualizar mi software.'],
    ],
    'Computadoras y programacion': [
      ['wo zai xue biancheng', '', 'Estoy aprendiendo a programar.'],
      ['zhe hang daima you cuowu', '', 'Hay un error en este codigo.'],
      ['ni neng kankan wo de xiangmu ma?', '', 'Puedes revisar mi proyecto?'],
      ['wo xuyao anzhuang zhege chengxu', '', 'Necesito instalar este programa.'],
    ],
    'Internet y redes sociales': [
      ['ni kandao wo fa de shipin le ma?', '', 'Viste el video que te mande?'],
      ['wo deng yixia gei ni fa xiaoxi', '', 'Te escribo un mensaje despues.'],
      ['wo de wangluo tai man le', '', 'Mi internet esta muy lento.'],
      ['women jinwan shipin tonghua ba', '', 'Hagamos una videollamada esta noche.'],
    ],
    'Inteligencia artificial': [
      ['rengong zhineng zhengzai gaibian women de gongzuo fangshi', '', 'La IA esta cambiando como trabajamos.'],
      ['wo yong rengong zhineng gongju lai xuexi', '', 'Uso una herramienta de IA para estudiar.'],
      ['ni juede rengong zhineng hui qudai gongzuo ma?', '', 'Crees que la IA reemplazara empleos?'],
      ['zhege liaotian jiqiren hen dong shangxiawen', '', 'Este chatbot entiende bien el contexto.'],
    ],
    'Videojuegos': [
      ['ni xiang gen wo yiqi wan youxi ma?', '', 'Quieres jugar un videojuego conmigo?'],
      ['wo gang dabai le zuizhong boss!', '', 'Acabo de vencer al jefe final!'],
      ['ni zui xihuan de youxi shi shenme?', '', 'Cual es tu videojuego favorito?'],
      ['xia yi ju women zudui ba', '', 'Hagamos equipo en la proxima ronda.'],
    ],
    'Musica': [
      ['ni xihuan shenme yang de yinyue?', '', 'Que tipo de musica te gusta?'],
      ['zhe shou ge yizhi zai wo naozi li', '', 'Esta cancion se me quedo pegada.'],
      ['ni hui tan shenme yueqi ma?', '', 'Tocas algun instrumento?'],
      ['women yiqi qu kan yanchanghui ba', '', 'Vayamos juntos a un concierto.'],
    ],
    'Peliculas': [
      ['ni kanguo zhe bu dianying ma?', '', 'Ya viste esta pelicula?'],
      ['ni zui xihuan shenme leixing de dianying?', '', 'Cual es tu genero favorito?'],
      ['jieju rang wo hen jingya', '', 'El final me sorprendio mucho.'],
      ['women jinwan kan dianr shenme ba', '', 'Veamos algo esta noche.'],
    ],
    'Negocios': [
      ['women dei zai zhouwu qian tancheng zhege hetong', '', 'Debemos cerrar este trato antes del viernes.'],
      ['women gen kehu anpai ge huiyi ba', '', 'Programemos una reunion con el cliente.'],
      ['women zhege jidu de xiaoshou zengzhang le', '', 'Nuestras ventas crecieron este trimestre.'],
      ['wo xiang ti yi ge xin xiangfa', '', 'Me gustaria proponer una nueva idea.'],
    ],
  },
};

/** Devuelve el banco completo de frases (crudo, con pronunciacion y traduccion). */
export function getPhraseBank() { return RAW; }

// Normaliza quitando tildes/mayúsculas para que la búsqueda no dependa de
// que las claves coincidan carácter a carácter (evita bugs por acentos).
function normalize(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

const INDEX = {};
Object.entries(RAW).forEach(([lang, topics]) => {
  INDEX[lang] = {};
  Object.entries(topics).forEach(([topic, list]) => {
    INDEX[lang][normalize(topic)] = list;
  });
});

/** Devuelve N frases de un tema/idioma, rotando con un desfase para variar entre repeticiones del mismo tema. */
export function getPhrasesForTheme(lang, topic, offset = 0, count = 3) {
  const list = INDEX[lang]?.[normalize(topic)];
  if (!list || !list.length) return [];
  const out = [];
  for (let i = 0; i < Math.min(count, list.length); i += 1) {
    out.push(list[(offset + i) % list.length]);
  }
  return out;
}
