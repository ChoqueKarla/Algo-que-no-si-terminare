/**
 * vocabularySeed.js
 * -----------------------------------------------------------------------
 * Catálogo de categorías de vocabulario (>30, ampliable) + banco de
 * palabras de ejemplo reales para arrancar la app (inglés, coreano y
 * chino mandarín). El usuario puede agregar, editar o borrar palabras
 * libremente desde la pantalla de Vocabulario; esto es solo el punto
 * de partida ("datos de ejemplo" pedidos en el brief).
 * -----------------------------------------------------------------------
 */
export const VOCAB_CATEGORIES = [
  'Saludos', 'Presentaciones', 'Números', 'Colores', 'Tiempo', 'Comida', 'Bebidas',
  'Familia', 'Animales', 'Casa', 'Universidad', 'Tecnología', 'Programación', 'Trabajo',
  'Compras', 'Viajes', 'Salud', 'Hospital', 'Sentimientos', 'Naturaleza', 'Clima',
  'Negocios', 'Internet', 'Computadoras', 'Redes', 'Inteligencia Artificial', 'Videojuegos',
  'Música', 'Películas', 'Emergencias', 'Deportes', 'Ropa', 'Ciudad', 'Transporte', 'Cuerpo humano',
];

// Cada entrada: [palabra, pronunciación, significado]
const RAW = {
  en: {
    Saludos: [['Hello', '/həˈloʊ/', 'Hola'], ['Good morning', '/ɡʊd ˈmɔːrnɪŋ/', 'Buenos días'], ['Good night', '/ɡʊd naɪt/', 'Buenas noches'], ['See you later', '/siː juː ˈleɪtər/', 'Nos vemos luego'], ['How are you?', '/haʊ ɑːr juː/', '¿Cómo estás?'], ['Nice to meet you', '/naɪs tuː miːt juː/', 'Mucho gusto']],
    Presentaciones: [['My name is', '/maɪ neɪm ɪz/', 'Mi nombre es'], ['I am from', '/aɪ æm frʌm/', 'Soy de'], ['I work as', '/aɪ wɜːrk æz/', 'Trabajo como'], ['I am years old', '/aɪ æm jɪrz oʊld/', 'Tengo ... años']],
    Números: [['One', '/wʌn/', 'Uno'], ['Two', '/tuː/', 'Dos'], ['Three', '/θriː/', 'Tres'], ['Ten', '/tɛn/', 'Diez'], ['Hundred', '/ˈhʌndrəd/', 'Cien'], ['Thousand', '/ˈθaʊzənd/', 'Mil']],
    Colores: [['Red', '/rɛd/', 'Rojo'], ['Blue', '/bluː/', 'Azul'], ['Green', '/ɡriːn/', 'Verde'], ['Black', '/blæk/', 'Negro'], ['White', '/waɪt/', 'Blanco']],
    Comida: [['Bread', '/brɛd/', 'Pan'], ['Rice', '/raɪs/', 'Arroz'], ['Chicken', '/ˈtʃɪkɪn/', 'Pollo'], ['Fruit', '/fruːt/', 'Fruta'], ['Vegetable', '/ˈvɛdʒtəbəl/', 'Verdura']],
    Bebidas: [['Water', '/ˈwɔːtər/', 'Agua'], ['Coffee', '/ˈkɔːfi/', 'Café'], ['Tea', '/tiː/', 'Té'], ['Juice', '/dʒuːs/', 'Jugo']],
    Familia: [['Mother', '/ˈmʌðər/', 'Madre'], ['Father', '/ˈfɑːðər/', 'Padre'], ['Brother', '/ˈbrʌðər/', 'Hermano'], ['Sister', '/ˈsɪstər/', 'Hermana']],
    Animales: [['Dog', '/dɔːɡ/', 'Perro'], ['Cat', '/kæt/', 'Gato'], ['Bird', '/bɜːrd/', 'Pájaro']],
    Casa: [['House', '/haʊs/', 'Casa'], ['Kitchen', '/ˈkɪtʃɪn/', 'Cocina'], ['Bedroom', '/ˈbɛdruːm/', 'Dormitorio']],
    Tecnología: [['Computer', '/kəmˈpjuːtər/', 'Computadora'], ['Phone', '/foʊn/', 'Teléfono'], ['Software', '/ˈsɔːftwɛr/', 'Software']],
    Trabajo: [['Job', '/dʒɑːb/', 'Trabajo'], ['Meeting', '/ˈmiːtɪŋ/', 'Reunión'], ['Deadline', '/ˈdɛdlaɪn/', 'Fecha límite']],
    Viajes: [['Airport', '/ˈɛrpɔːrt/', 'Aeropuerto'], ['Ticket', '/ˈtɪkɪt/', 'Boleto'], ['Passport', '/ˈpæspɔːrt/', 'Pasaporte']],
    Salud: [['Doctor', '/ˈdɑːktər/', 'Doctor'], ['Medicine', '/ˈmɛdɪsɪn/', 'Medicina'], ['Pain', '/peɪn/', 'Dolor']],
    Emergencias: [['Help!', '/hɛlp/', '¡Ayuda!'], ['Fire', '/ˈfaɪər/', 'Fuego'], ['Police', '/pəˈliːs/', 'Policía']],
    Clima: [['Rain', '/reɪn/', 'Lluvia'], ['Sun', '/sʌn/', 'Sol'], ['Cold', '/koʊld/', 'Frío']],
  },
  ko: {
    Saludos: [['안녕하세요', 'annyeonghaseyo', 'Hola (formal)'], ['안녕', 'annyeong', 'Hola (informal)'], ['좋은 아침이에요', 'joeun achimieyo', 'Buenos días'], ['안녕히 가세요', 'annyeonghi gaseyo', 'Adiós (a quien se va)'], ['어떻게 지내세요?', 'eotteoke jinaeseyo?', '¿Cómo estás?'], ['만나서 반가워요', 'mannaseo bangawoyo', 'Mucho gusto']],
    Presentaciones: [['제 이름은', 'je ireumeun', 'Mi nombre es'], ['저는 ...에서 왔어요', 'jeoneun ...eseo wasseoyo', 'Soy de ...'], ['저는 ...살이에요', 'jeoneun ...sarieyo', 'Tengo ... años']],
    Números: [['하나', 'hana', 'Uno (nativo)'], ['둘', 'dul', 'Dos (nativo)'], ['일', 'il', 'Uno (sino-coreano)'], ['이', 'i', 'Dos (sino-coreano)'], ['십', 'sip', 'Diez'], ['백', 'baek', 'Cien']],
    Colores: [['빨간색', 'ppalgansaek', 'Rojo'], ['파란색', 'paransaek', 'Azul'], ['초록색', 'choroksaek', 'Verde'], ['검은색', 'geomeunsaek', 'Negro']],
    Comida: [['밥', 'bap', 'Arroz / comida'], ['김치', 'gimchi', 'Kimchi'], ['고기', 'gogi', 'Carne'], ['과일', 'gwail', 'Fruta']],
    Bebidas: [['물', 'mul', 'Agua'], ['커피', 'keopi', 'Café'], ['차', 'cha', 'Té']],
    Familia: [['어머니', 'eomeoni', 'Madre'], ['아버지', 'abeoji', 'Padre'], ['형/오빠', 'hyeong/oppa', 'Hermano mayor'], ['동생', 'dongsaeng', 'Hermano/a menor']],
    Animales: [['개', 'gae', 'Perro'], ['고양이', 'goyangi', 'Gato'], ['새', 'sae', 'Pájaro']],
    Casa: [['집', 'jip', 'Casa'], ['부엌', 'bueok', 'Cocina'], ['방', 'bang', 'Habitación']],
    Tecnología: [['컴퓨터', 'keompyuteo', 'Computadora'], ['휴대폰', 'hyudaepon', 'Celular']],
    Trabajo: [['일', 'il', 'Trabajo'], ['회의', 'hoeui', 'Reunión']],
    Viajes: [['공항', 'gonghang', 'Aeropuerto'], ['여권', 'yeogwon', 'Pasaporte']],
    Salud: [['의사', 'uisa', 'Doctor'], ['약', 'yak', 'Medicina']],
    Emergencias: [['도와주세요!', 'dowajuseyo!', '¡Ayuda!'], ['경찰', 'gyeongchal', 'Policía']],
    Clima: [['비', 'bi', 'Lluvia'], ['눈', 'nun', 'Nieve'], ['더워요', 'deowoyo', 'Hace calor']],
  },
  zh: {
    Saludos: [['你好', 'nǐ hǎo', 'Hola'], ['早上好', 'zǎoshang hǎo', 'Buenos días'], ['晚安', 'wǎn ān', 'Buenas noches'], ['再见', 'zàijiàn', 'Adiós'], ['你好吗？', 'nǐ hǎo ma?', '¿Cómo estás?'], ['很高兴认识你', 'hěn gāoxìng rènshi nǐ', 'Mucho gusto']],
    Presentaciones: [['我叫', 'wǒ jiào', 'Me llamo'], ['我来自', 'wǒ láizì', 'Soy de'], ['我...岁', 'wǒ ... suì', 'Tengo ... años']],
    Números: [['一', 'yī', 'Uno'], ['二', 'èr', 'Dos'], ['三', 'sān', 'Tres'], ['十', 'shí', 'Diez'], ['百', 'bǎi', 'Cien'], ['千', 'qiān', 'Mil']],
    Colores: [['红色', 'hóngsè', 'Rojo'], ['蓝色', 'lánsè', 'Azul'], ['绿色', 'lǜsè', 'Verde'], ['黑色', 'hēisè', 'Negro']],
    Comida: [['米饭', 'mǐfàn', 'Arroz'], ['面条', 'miàntiáo', 'Fideos'], ['肉', 'ròu', 'Carne'], ['水果', 'shuǐguǒ', 'Fruta']],
    Bebidas: [['水', 'shuǐ', 'Agua'], ['咖啡', 'kāfēi', 'Café'], ['茶', 'chá', 'Té']],
    Familia: [['妈妈', 'māma', 'Mamá'], ['爸爸', 'bàba', 'Papá'], ['哥哥', 'gēge', 'Hermano mayor'], ['妹妹', 'mèimei', 'Hermana menor']],
    Animales: [['狗', 'gǒu', 'Perro'], ['猫', 'māo', 'Gato'], ['鸟', 'niǎo', 'Pájaro']],
    Casa: [['家', 'jiā', 'Casa'], ['厨房', 'chúfáng', 'Cocina'], ['房间', 'fángjiān', 'Habitación']],
    Tecnología: [['电脑', 'diànnǎo', 'Computadora'], ['手机', 'shǒujī', 'Celular']],
    Trabajo: [['工作', 'gōngzuò', 'Trabajo'], ['会议', 'huìyì', 'Reunión']],
    Viajes: [['机场', 'jīchǎng', 'Aeropuerto'], ['护照', 'hùzhào', 'Pasaporte']],
    Salud: [['医生', 'yīshēng', 'Doctor'], ['药', 'yào', 'Medicina']],
    Emergencias: [['救命！', 'jiùmìng!', '¡Ayuda!'], ['警察', 'jǐngchá', 'Policía']],
    Clima: [['下雨', 'xiàyǔ', 'Llueve'], ['冷', 'lěng', 'Frío'], ['热', 'rè', 'Calor']],
  },
};

/** Convierte el catálogo crudo en objetos de palabra listos para guardar. */
export function buildSeedVocabulary() {
  const out = { en: [], ko: [], zh: [] };
  Object.entries(RAW).forEach(([lang, categories]) => {
    Object.entries(categories).forEach(([category, words]) => {
      words.forEach(([word, pronunciation, meaning], i) => {
        out[lang].push({
          id: `seed_${lang}_${category}_${i}`.replace(/\s+/g, ''),
          word, pronunciation, meaning, category,
          level: 'A0',
          status: 'nuevo', // nuevo | aprendiendo | repasando | dominada
          learnedDate: null,
          nextReview: null,
          interval: 0,
          repetitions: 0,
          favorite: false,
          mastered: false,
          difficult: false,
          notes: '',
        });
      });
    });
  });
  return out;
}
