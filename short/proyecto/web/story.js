
export const fps=30;
export const seconds=40.90775;
export const frameCount=Math.ceil(seconds*fps);
export const events=Object.freeze({first:125/fps,second:217/fps,alarm:321/fps,toggle:926/fps});
export const shots=[
 [0,'launch'],[2.66,'storm',0],[5.03,'storm',1],[8.08,'cabin','alarm'],[10.66,'cabin','alarmPanel'],
 [11.86,'control','numbers'],[15.58,'control','recognize'],[19.57,'control','test'],
 [22.76,'mechanism','preview'],[26.34,'control','radio'],[27.87,'cabin','reach'],
 [29.50,'mechanism','toggle'],[31.90,'control','clear'],[34.06,'cabin','recover'],
 [37.43,'orbit']
];
export const captions=[
 [0,1.16,'EL APOLO 12 LLEVABA'],
 [1.20,2.49,'37 SEGUNDOS'],
 [2.54,3.43,'EN EL AIRE CUANDO'],
 [3.46,4.78,'LE CAYÓ UN RAYO'],
 [5.04,6.44,'ANTES DE CUMPLIR UN MINUTO'],
 [6.80,7.88,'LE CAYÓ OTRO'],
 [8.12,9.72,'EL COHETE SEGUÍA SUBIENDO'],
 [9.96,11.25,'PERO EN LA CABINA'],
 [11.28,12.19,'SALTABAN LAS ALARMAS'],
 [12.20,13.27,'Y EN HOUSTON APARECÍAN'],
 [13.30,14.99,'NÚMEROS QUE NO TENÍAN SENTIDO'],
 [15.68,16.82,'UN CONTROLADOR'],
 [16.88,17.69,'JOHN AARON'],
 [17.74,18.98,'RECONOCIÓ AQUELLOS NÚMEROS'],
 [19.62,20.59,'YA LOS HABÍA VISTO'],
 [20.62,22.06,'EN UNA PRUEBA EN TIERRA'],
 [22.07,23.39,'Y SABÍA QUÉ'],
 [23.40,24.44,'INTERRUPTOR PODÍA'],
 [24.54,25.94,'DEVOLVERLES LAS LECTURAS'],
 [26.44,27.84,'HOUSTON DIO LA INSTRUCCIÓN'],
 [27.96,29.01,'ALAN BEAN'],
 [29.04,29.96,'ENCONTRÓ EL MANDO'],
 [29.97,31.43,'Y LO PUSO EN MODO AUXILIAR'],
 [31.94,32.97,'LOS DATOS VOLVIERON'],[33.04,33.91,'A TENER SENTIDO'],
 [34.40,35.64,'LA TRIPULACIÓN RECUPERÓ'],
 [35.66,36.79,'LA ALIMENTACIÓN PRINCIPAL'],
 [36.82,38.87,'TRAS REVISAR LA NAVE EN ÓRBITA'],
 [39.48,40.90,'SIGUIÓ RUMBO A LA LUNA']
];
