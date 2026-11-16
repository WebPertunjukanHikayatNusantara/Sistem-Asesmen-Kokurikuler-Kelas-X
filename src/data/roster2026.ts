import { ClassGroup, SEVEN_DPK_DIVISIONS } from '../types';

export interface OfficialRosterEntry {
  id: string;
  nisn: string;
  name: string;
  classGroup: ClassGroup;
  email: string;
  primaryDivisionId: string;
}

interface RawRosterSeed {
  nisn: string;
  name: string;
}

const RAW_ROSTER_BY_CLASS: Record<ClassGroup, RawRosterSeed[]> = {
  'X-1': [
    { nisn: '18999/0118210255', name: 'Adrianus Gandhi Ganendra Prapnawan' },
    { nisn: '19000/0117432710', name: 'Angela Merici Anindya Calista Putri' },
    { nisn: '19001/0108890035', name: 'Angela Serafiana Sari' },
    { nisn: '19002/0116874516', name: 'Audryan Mahendra Kusuma Jati' },
    { nisn: '19003/0116934936', name: 'Axel Valentino Kenzie Arthanawansyah' },
    { nisn: '19004/0112176234', name: 'Bennet Ayma Handoko' },
    { nisn: '19005/0109533533', name: 'Brilliant Gavin Lebanese' },
    { nisn: '19006/0115536621', name: 'Chika Jovita Abigail' },
    { nisn: '19007/0101261746', name: 'Chrispina Bimasthi Tunjung Widhiarti' },
    { nisn: '19008/0112448033', name: 'Dimas Wisnutama' },
    { nisn: '19009/0101627184', name: 'Dionisius Chrisnanda Nevan Dwi Putra' },
    { nisn: '19010/0106278899', name: 'Dyma Nimas Anjani' },
    { nisn: '19011/0108770017', name: 'Early Aulia Zahra Hermano' },
    { nisn: '19012/0111432461', name: 'Filadelfia Charissa Bheta' },
    { nisn: '19013/0117760786', name: 'Gracea Audy Neviandrea' },
    { nisn: '19014/0101232889', name: 'Jenytha Abigail Kannia Putri' },
    { nisn: '19015/0116723554', name: 'Jephtah Ronnell Pradipa' },
    { nisn: '19016/0117725750', name: 'Kristoforus Jonathan Wira' },
    { nisn: '19017/0102005980', name: 'Margareta Anggelis Gracia Putri' },
    { nisn: '19018/0116774033', name: 'Maria Ratu Rosari Suci' },
    { nisn: '19019/0117051012', name: 'Matthew Chiko Putra Wahyudi' },
    { nisn: '19020/0108099071', name: 'Michael Danadyaksa Dimatra Karmanto' },
    { nisn: '19021/0112277495', name: 'Monica Fitri Nariswari Sadwika Setya' },
    { nisn: '19022/0117031001', name: 'Narwastu Kidung Lembayung' },
    { nisn: '19023/0112149755', name: 'Nawang Eben Haezer' },
    { nisn: '19024/0111694930', name: 'Otniel Zheva Kristiyanto' },
    { nisn: '19025/0107237305', name: 'Rafael Gonza Pradipta' },
    { nisn: '19026/0102736734', name: 'Rafael Jeremy Putra' },
    { nisn: '19027/0107356061', name: 'Samuel Alexander Noval' },
    { nisn: '19028/0112749832', name: 'Sesilia Eleonora Daleito' },
    { nisn: '19029/0119460163', name: 'Shiloh Hope Jazzlyn Hartanto' },
    { nisn: '19030/0118909786', name: 'Skolastika Jesse Michaelia' },
    { nisn: '19031/0105161066', name: 'Vincentia Jesslyn Satriani' },
    { nisn: '19032/0119975533', name: 'William Angelo Aryasatya Wijayanto' }
  ],
  'X-2': [
    { nisn: '19033/0081633992', name: 'Ancilla Domini Marta Kasih Saputro' },
    { nisn: '19034/0115549000', name: 'Angelica Gabriela Teresa Duarte' },
    { nisn: '19035/0114065002', name: 'Aurellya Fortunata Hartanto' },
    { nisn: '19036/0112077329', name: 'Aurora Ilaviandra Padmawardhani' },
    { nisn: '19037/0113050223', name: 'Ayunda Rozene Achillez Sharon' },
    { nisn: '19038/0118970064', name: 'Bernadette Rayadinata Valencia Astanto' },
    { nisn: '19039/0124854370', name: 'Cahaya Putri Kristiani' },
    { nisn: '19040/0113212373', name: 'Cayla Olivia Pramidita' },
    { nisn: '19041/0119612918', name: 'Christiano Rizky Budiman' },
    { nisn: '19042/0109171273', name: 'Davin Tafalua Sisokhi Laia' },
    { nisn: '19043/0111036929', name: 'F. X. Bimo Wahyu Prakoso' },
    { nisn: '19044/0108516803', name: 'Felicya Wilma Santoso' },
    { nisn: '19045/0111048793', name: 'Fio Dinata Br Sinaga' },
    { nisn: '19046/0119707203', name: 'Georgius Aprilio Putra Pratomo' },
    { nisn: '19047/0106102540', name: 'Ifa Nola Grace Kristin Br Ginting' },
    { nisn: '19048/0109834072', name: 'Ignatius Alta Kurniawan' },
    { nisn: '19049/0114339357', name: 'Kent Yoshi Haru' },
    { nisn: '19050/0112360893', name: 'Leticia Dustin Orlenda' },
    { nisn: '19051/0103190315', name: 'Lintang Dunya' },
    { nisn: '19052/0112153856', name: 'Louis Deflanandra Jovan Fievellano' },
    { nisn: '19053/0116469848', name: 'Louisa Celine Latisha Danila' },
    { nisn: '19054/0114621429', name: 'Maria Mutiara Cista' },
    { nisn: '19055/0111961911', name: 'Maria Redemtha Tarisha Radinka' },
    { nisn: '19056/0108409038', name: 'Nathanael Brito Palewi' },
    { nisn: '19057/0119082531', name: 'Paulus Febri Adita Putra' },
    { nisn: '19059/0119343505', name: 'Rachelea Indie Cristiyani' },
    { nisn: '19058/0146813533', name: 'Rain Kwik' },
    { nisn: '19060/0119390680', name: 'Sakya Dharma Putra' },
    { nisn: '19061/0111762352', name: 'Timothy Axel Utomo' },
    { nisn: '19062/0114555917', name: 'Valerie Gianina Putri' },
    { nisn: '19063/0118025731', name: 'Vincentius Billy Hendarta' },
    { nisn: '19064/0109348166', name: 'Virgillius Chrisvilano Wiandra' },
    { nisn: '19065/3107367017', name: 'Yaku Rafael Kinho' },
    { nisn: '19066/0103547918', name: 'Zain Yazid Azizi' }
  ],
  'X-3': [
    { nisn: '19067/0119134950', name: 'Aleycia Anjeli Ayodhya Rahatma' },
    { nisn: '19068/0118908891', name: 'Athanasius Satria Kusuma Warih' },
    { nisn: '19069/0109952491', name: 'Belva Callysta Novelia' },
    { nisn: '19070/0112324223', name: 'Bernardinus Diovan Arda Putra Pratama' },
    { nisn: '19071/0116846461', name: 'Bonaventura Vino Kin Ravael' },
    { nisn: '19072/0109238511', name: 'Calista Pelangi Citra Pertiwi' },
    { nisn: '19073/0113055916', name: 'Cantique Angelia Putri' },
    { nisn: '19074/0119640230', name: 'Christine Natasya' },
    { nisn: '19075/0109382833', name: 'Dina Vivian' },
    { nisn: '19076/0117928751', name: 'Faustina Elizabeth Keyla Bakti' },
    { nisn: '19077/0119360030', name: 'Funessa Earlicia Christi' },
    { nisn: '19078/0116535323', name: 'Gabriel Bintang Danesa' },
    { nisn: '19079/0117570321', name: 'Gabriella Adrianti Anjani' },
    { nisn: '19080/0102251543', name: 'Gracello Jozidhie' },
    { nisn: '19081/0112956257', name: 'Gregoriana Nevada' },
    { nisn: '19082/0101156307', name: 'Ignando Adi Nugraha' },
    { nisn: '19083/0113437341', name: 'Ignatia Raras Arjanti Rismawati' },
    { nisn: '19084/0117283117', name: 'Irine Kendra Pangestuti' },
    { nisn: '19085/0112598242', name: 'Jepun Rahpatani' },
    { nisn: '19086/0107171118', name: 'Kadho Alfredo' },
    { nisn: '19087/0117123011', name: 'Kevin Petra Staulus' },
    { nisn: '19088/0111027022', name: 'Kiara Fabioshifa' },
    { nisn: '19089/0102803589', name: 'Lovensia Noelita Anantyo Putri' },
    { nisn: '19090/0117732713', name: 'Mikaela Sekar Ayu Wibowo' },
    { nisn: '19091/0115606538', name: 'Natasya Kasih Wahyu Santoso' },
    { nisn: '19092/0106732522', name: 'Nathaniel Giovanni Kristyan Abijono' },
    { nisn: '19093/0103843494', name: 'Nicholas Christmast Dhery Putra' },
    { nisn: '19094/0108870141', name: 'Queensa Jevon Prambono' },
    { nisn: '19095/0115887862', name: 'Rachel Adriella Tetelepta' },
    { nisn: '19096/0114602088', name: 'Rafael Zorgy Gultom' },
    { nisn: '19097/0126090802', name: 'Richard Steven' },
    { nisn: '19098/0106110913', name: 'Sweetsa Adya Andharu' },
    { nisn: '19099/0113016198', name: 'Vincentius Edward Adrian Hartanto' },
    { nisn: '19199/0117248475', name: 'Jason Salomon Kaya' }
  ],
  'X-4': [
    { nisn: '19100/0115859815', name: 'Agni Dinda Larasati' },
    { nisn: '19101/0115428557', name: 'Allena Christianne Putri' },
    { nisn: '19102/0081273019', name: 'Ancilla Domini Maria Cinta Saputro' },
    { nisn: '19103/0118410931', name: 'Angelina Merici Kristina Harjanto' },
    { nisn: '19104/0101167019', name: 'Arthur Sefaca Santoso' },
    { nisn: '19105/0105602017', name: 'Arvin Alvino' },
    { nisn: '19106/0111977727', name: 'Aurelia Kanaya Tabitha' },
    { nisn: '19107/0119215938', name: 'Clifferel Matthew Pranyoto' },
    { nisn: '19108/0101152105', name: 'Davina Nadine Putri Tiana' },
    { nisn: '19109/0119724200', name: 'El Lavendra' },
    { nisn: '19110/0118095452', name: 'Idam Abimanyu Nugroho' },
    { nisn: '19111/0115656396', name: 'Jessica Melviana Saputri' },
    { nisn: '19112/0115221660', name: 'Joicella Kinsey Putri Prasetyo' },
    { nisn: '19113/0117815052', name: 'Jonathan Prabowo' },
    { nisn: '19114/0112869291', name: 'Joshua Bigjoy Immanuel Mendrofa' },
    { nisn: '19115/0118915324', name: 'Katrina Javelin' },
    { nisn: '19116/0114901020', name: 'Madonna Antonia Andisa Caliandra' },
    { nisn: '19117/0115273889', name: 'Maria Paskalia Khasandra' },
    { nisn: '19118/0118618277', name: 'Micco Christian' },
    { nisn: '19119/0111558920', name: 'Michael Cleon Dhana Adhyaksha' },
    { nisn: '19120/0116521173', name: 'Mikael Farrel Yeabsera' },
    { nisn: '19121/0105958382', name: 'Natasya Ajeng Ayuningtyas' },
    { nisn: '19122/0113538450', name: 'Nathanael Dandi Vavian Ananta' },
    { nisn: '19123/0115012462', name: 'Oliver Richie Tedjasaputra' },
    { nisn: '19124/0104135967', name: 'Pratama Adinata Putra Daiva Krisnha' },
    { nisn: '19125/0104748498', name: 'Raditya Elang Sinatria' },
    { nisn: '19126/0105818557', name: 'Ratri Herawati' },
    { nisn: '19127/0113583565', name: 'Ravell Fulviano Cristian' },
    { nisn: '19128/0105566518', name: 'Skolastika Kiranaya Kamaratih' },
    { nisn: '19129/0104485397', name: 'Stefani Evangelista Arrang Prayitno' },
    { nisn: '19130/0114473800', name: 'Stefano Frederick Wisnuaji' },
    { nisn: '19131/0118506113', name: 'Tasha Ivena Setiawan' },
    { nisn: '19132/0116542325', name: 'Veronica Adelia Putri Fernanda' },
    { nisn: '-', name: 'Russel Mahessa Santosa' }
  ],
  'X-5': [
    { nisn: '19133/0114104738', name: 'Adelin Hannah Anggita' },
    { nisn: '19134/0116023080', name: 'Agnesia Rehuel Kanatalia' },
    { nisn: '19135/0104699407', name: 'Aleksandria Fiona Olivia' },
    { nisn: '19136/0111353753', name: 'Alexandra Jyoti Nugroho' },
    { nisn: '19137/0099417575', name: 'Alice Jessica Carolline Wynona Christie' },
    { nisn: '19138/0114268768', name: 'Amadea Carmen Putri Prakoso' },
    { nisn: '19139/0113524421', name: 'Anastasia Alia Putri Agitha' },
    { nisn: '19140/0103130049', name: 'Anindya Raras Rum' },
    { nisn: '19141/0109956683', name: 'Antonius Mario Aria Ananda' },
    { nisn: '19142/0101042059', name: 'Aurelia Gendhis Kusuma Indarto' },
    { nisn: '19143/0112149573', name: 'Avril Zalfa Miyuki Susilo' },
    { nisn: '19144/0124755031', name: 'Bernadeta Jeslyn Hentriciana' },
    { nisn: '19145/0108687285', name: 'Bintang Sandi Yudha' },
    { nisn: '19146/0119360970', name: 'Cherryl Gabriella Sebastian' },
    { nisn: '19147/0101781188', name: 'Eugenia Griselda Maheswari' },
    { nisn: '19148/0104598840', name: 'Fiorentina Videl Aurerra' },
    { nisn: '19150/0106595890', name: 'Geovano Krisna Wardana' },
    { nisn: '19151/0116820772', name: 'Jehezkiel Natha Abhipraya' },
    { nisn: '19152/0113421582', name: 'Leonardus Candra Andromeda' },
    { nisn: '19153/0113582805', name: 'Lord Revlo Kynaseta' },
    { nisn: '19154/0114127135', name: 'Maheswari Asmara Andrianto' },
    { nisn: '19149/0101606679', name: 'Marshel Putra Lamkosta' },
    { nisn: '19155/0101167567', name: 'Nathan El Raffa Baginda Agung Sitoroes' },
    { nisn: '19156/0116334230', name: 'Odilia Loysa Immaculata' },
    { nisn: '19157/0108717390', name: 'Olavinda Kinarningtyas' },
    { nisn: '19158/0106652223', name: 'Pande Made Canon Arta Negara' },
    { nisn: '19159/0103540067', name: 'Regina Vanessa Hartanto' },
    { nisn: '19160/3095270436', name: 'Rouben Hazael Santoso Herawan' },
    { nisn: '19161/0114932447', name: 'Satria Aji Nugraha' },
    { nisn: '19162/0103406863', name: 'Steven Bima Wijaya Manuputty' },
    { nisn: '19163/0118049885', name: 'Teofilus Alviano Saputra' },
    { nisn: '19164/0114539955', name: 'Vincentius Banyu Adhidrawa Wijanarko' },
    { nisn: '19165/0106800612', name: 'Yohana Adventie Putri Alexandra' },
    { nisn: '-', name: 'Dewi Rustriningsih' }
  ],
  'X-6': [
    { nisn: '19166/0115860420', name: 'Angellin Meisya Crystie' },
    { nisn: '19167/0102585724', name: 'Anggit Tessa Maritza' },
    { nisn: '19168/0112237140', name: 'Christian Alvin Junendra' },
    { nisn: '19169/0108049869', name: 'Christian Sumarhardianto' },
    { nisn: '19170/0104857329', name: 'Clara Adya Elvaretta' },
    { nisn: '19171/0115041989', name: 'Deo Gratias Wasis Prasaja' },
    { nisn: '19172/0116093585', name: 'Evelyn Hany Netanya' },
    { nisn: '19173/0102056781', name: 'Fatra Alviano Kristanto' },
    { nisn: '19174/0115793015', name: 'Feilix Fernando' },
    { nisn: '19175/0103897907', name: 'Filipus Bagas Wiradhika' },
    { nisn: '19176/0104790764', name: 'Gerrardus Javas Banyu Darmawan' },
    { nisn: '19177/0119244480', name: 'Gracia Putri Arnanda' },
    { nisn: '19178/0106002129', name: 'Gretchen Fredeline Dewanto' },
    { nisn: '19179/0107246849', name: 'Irene Aldeira Hosiana Rosari' },
    { nisn: '19180/0115057278', name: 'Jeanne Debora Cellin' },
    { nisn: '19181/0101004555', name: 'Jovita Mariana Renata' },
    { nisn: '19182/0111356174', name: 'Kheysa Adelia Putri Utomo' },
    { nisn: '19183/0108458582', name: 'Magdalena Stella Sekarmaya Hadikusuma' },
    { nisn: '19184/0108937357', name: 'Martina Puan Tiarani' },
    { nisn: '19185/0112137273', name: 'Michael Pascha Salvatori' },
    { nisn: '19186/0113103526', name: 'Mikael Imanuel Narayana Asa' },
    { nisn: '19187/0116697750', name: 'Nicholas Hasiholan Lamrotua Sibuea' },
    { nisn: '19188/0107180786', name: 'Olivia Sharon Joycellin Kusuma Nugroho' },
    { nisn: '19189/0105162554', name: 'Renata Natalie Baskoro' },
    { nisn: '19190/0115633951', name: 'Rhefaya Tirza Nataniella' },
    { nisn: '19191/0111961152', name: 'Rizky Adrian Saputra' },
    { nisn: '19192/0107217940', name: 'Satya Kalyana' },
    { nisn: '19193/0118147113', name: 'Sistus Yoel Abani' },
    { nisn: '19194/0117054772', name: 'Theofani Novelina Aritonang' },
    { nisn: '19195/0113969412', name: 'Winatra Fredlyn Kristio Nugroho' },
    { nisn: '19196/0119869773', name: 'Wira Refaldo Manalu' },
    { nisn: '19197/0118505876', name: 'Yosepin Valea Gerardini Putri Farly' },
    { nisn: '19198/0111822543', name: 'Yunatsan Phoenix Aryawibawa' },
    { nisn: '-', name: 'Yelimishu Damai Harsari' },
    { nisn: '-', name: 'Gabriel Alexander Katho' }
  ]
};

const toSafeSlug = (val: string): string =>
  val
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48);

let globalCounter = 0;

export const OFFICIAL_ROSTER_2026: OfficialRosterEntry[] = (
  Object.keys(RAW_ROSTER_BY_CLASS) as ClassGroup[]
).flatMap((cls) => {
  const clsSlug = cls.toLowerCase().replace('-', '');
  return RAW_ROSTER_BY_CLASS[cls].map((item) => {
    const nisPart = item.nisn !== '-' ? item.nisn.split('/')[0] : toSafeSlug(item.name);
    const id = `std_${clsSlug}_${nisPart}`;
    const division = SEVEN_DPK_DIVISIONS[globalCounter % SEVEN_DPK_DIVISIONS.length];
    globalCounter += 1;
    return {
      id,
      nisn: item.nisn,
      name: item.name,
      classGroup: cls,
      email: `${id}@siswa.smyosef.sch.id`,
      primaryDivisionId: division.id
    };
  });
});
