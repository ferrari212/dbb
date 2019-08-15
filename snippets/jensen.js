//Vector declaration before the main function -- They are used to calculate the properties//
var wave_freq = [];
var Vertical_Movement=[];
var Vertical_Acceleration=[];
var Pitch_Movement=[];
var Heave_Movement=[];
var Bending_Moment=[];
var Roll_Movement=[];
var wave_period=[];
                
calculate_all();
                
//Main Function that will run each time one slider  is changed//					
function calculate_all(){
            
    //Vector declaration in the the main function -- They receive the properties and are used to plot the curves//
    var Results_array1=[];
    var Results_array2=[];
    var Results_array3=[];
    var Results_array4=[];
    var Results_array5=[]; 
    var Results_array6=[];
    var Results_array7=[];
                
            
    //Receives and changes the values from the Input sliders//	
    Length = document.getElementById("lwl_s").value;
    document.getElementById("lwl_val").value = Length;
    W_Breadth = document.getElementById("bwl_s").value;
    document.getElementById("bwl_val").value = W_Breadth;
    Block = document.getElementById("cb_s").value;
    document.getElementById("cb_val").value = Block;
    Draft = document.getElementById("tf_s").value;
    document.getElementById("tf_val").value = Draft;
    Speed = document.getElementById("sp_s").value;
    document.getElementById("sp_val").value = Speed;
    Heading = document.getElementById("heading_s").value;
    document.getElementById("heading_val").value = Heading;
    Position = document.getElementById("cg_s").value;
    document.getElementById("cg_val").value = Position;
    Wave_Amplitude = document.getElementById("amplitude_s").value;
    document.getElementById("amplitude_val").value = Wave_Amplitude;
               
                
    //These constants and variables are prepared to be used inside the "for()" that calculates the vessels motion responses //
        
    g=9.81;	
    heading=Heading;
    betha=heading*Math.PI/180;

    Breadth = W_Breadth*Block;
    Speed_metric=Speed*0.5144444;
    Froude_N=Speed_metric/Math.sqrt((g*Length));
    position=Length*Position/200;

    //This "for()" calculates the vessel responses to different waves frequencies//
                
    for (i = 0; i <= 1000; i++)
    {
    wave_freq[i]=0.05+1.95*i/1000;
    wave_number=Math.pow(wave_freq[i],2)/g;
    eff_wave_number=Math.abs(wave_number*Math.cos(betha));
    smith_factor=Math.exp(-wave_number*Draft);
    alpha=1-Froude_N*Math.sqrt(wave_number*Length)*Math.cos(betha);
    sectional_hydro_damping=2*Math.sin(0.5*wave_number*Breadth*Math.pow(alpha,2))
        *Math.exp(-wave_number*Draft*Math.pow(alpha,2));
    a=Math.pow(1-wave_number*Draft,2);
    b=Math.pow((Math.pow(sectional_hydro_damping,2)/(wave_number*Breadth*Math.pow(alpha,3))),2);
    f=Math.sqrt(a+b);
    F=smith_factor*f*(2/(eff_wave_number*Length))*Math.sin(eff_wave_number*Length/2);
    G=smith_factor*f*(24/(Math.pow(eff_wave_number*Length,2)*Length))*
        (Math.sin(eff_wave_number*Length/2)-(eff_wave_number*Length/2)*
        Math.cos(eff_wave_number*Length/2));
    eta=1/(Math.sqrt(Math.pow((1-2*wave_number*Draft*Math.pow(alpha,2)),2)+
        Math.pow(Math.pow(sectional_hydro_damping,2)/
        (wave_number*Breadth*Math.pow(alpha,2)),2)));
    FRF_Heave=Wave_Amplitude*eta* F;
    FRF_Pitch=Wave_Amplitude*eta* G;

    Vertical_Movement[i]=Math.sqrt(Math.pow(FRF_Heave,2) + Math.pow(FRF_Pitch,2)*Math.pow(position,2));
    Vertical_Acceleration[i]=Math.pow(alpha,2)*wave_number*g*Vertical_Movement[i];
    Pitch_Movement[i]=Math.sqrt(Math.pow(FRF_Pitch,2)*Math.pow(position,2));
    Heave_Movement[i]=Math.abs(FRF_Heave);
        
        //Bending Moment Response//
        
    Cb=Math.max(0.6,Block);    
    phi=2.5*(1-Cb);    
    F_Cb=(Math.pow(1-phi,2)+0.6*alpha*(2-phi));  
        
    F_v=1+3*Math.pow(Froude_N,2);    
        
    Bending_Moment[i]=Wave_Amplitude*(smith_factor*((1-wave_number*Draft)/(Math.pow(Length*eff_wave_number,2)))*(1-Math.cos(eff_wave_number*Length/2)-(eff_wave_number*Length/4)*Math.sin(eff_wave_number*Length/2))*F_v*F_Cb*Math.pow(Math.abs(Math.cos(betha)),1/3))*1025*g*W_Breadth*Length*Length/1000000;
        
    }

    ////// ROLL /////

    Cwp = document.getElementById("cwl_s").value;
    document.getElementById("cwl_val").value = Cwp; 
    GM = document.getElementById("gmt_s").value;
    document.getElementById("gmt_val").value = GM; 
    natural_period = document.getElementById("roll_s").value;
    document.getElementById("roll_val").value = natural_period; 
    critical_damping_percentage = document.getElementById("damping_s").value;
    document.getElementById("damping_val").value = critical_damping_percentage;
    delta = parseFloat(document.getElementById("plr_s").value );
    document.getElementById("plr_val").value = delta;


    //      Cwp = 0.713;   
    critical_damping_percentage = critical_damping_percentage/100;
    //       natural_period = 6.3;
    //       GM=4.19;

    //roll_hydro_damping = 1;
    //excitation_frequency=10000000;

    B_0 = W_Breadth;    
    Cb=Block;
    //document.getElementById("Tn_guess").innerHTML = Math.round(0.85*W_Breadth*10/Math.sqrt(GM))/10;    
    restoring_moment_coeff = g*1025*Cb*Length*W_Breadth*Draft*GM;    

    for (i = 0; i <= 1000; i++){
        
        wave_freq[i]=0.05+1.95*i/1000;
        wave_period[i]=2*3.14159/wave_freq[i];
        wave_number=Math.pow(wave_freq[i],2)/g;

        alpha=1-Froude_N*Math.sqrt(wave_number*Length)*Math.cos(betha);
        encounter_frequency =  wave_freq[i]*alpha;           
        eff_wave_number=Math.abs(wave_number*Math.cos(betha));
        
        breadth_ratio =  (Cwp - delta)/(1 - delta);
        B_1 = breadth_ratio*B_0;
        A_0 = Cb*B_0*Draft/(delta+breadth_ratio*(1-delta));
        A_1 = breadth_ratio*A_0;
        
        //sectional damping coefficient//
        Breadth_Draft_ratio = B_0/Draft;                                
            //3 <= B/T <= 6//
        if (Breadth_Draft_ratio>3){
            a0=0.256*Breadth_Draft_ratio - 0.286;
            b0=-0.11*Breadth_Draft_ratio - 2.55;
            d0=0.033*Breadth_Draft_ratio - 1.419;
        }
        
            //1 <= B/T <= 3//
        else {
            a0=-3.94*Breadth_Draft_ratio + 13.69;
            b0=-2.12*Breadth_Draft_ratio - 1.89;
            d0=1.16*Breadth_Draft_ratio-7.97;
        }
        
        Breadth_Draft_ratio = B_1/Draft;                                
            //3 <= B/T <= 6//
        if (Breadth_Draft_ratio>3){
            a1=0.256*Breadth_Draft_ratio - 0.286; 
            b1=-0.11*Breadth_Draft_ratio - 2.55;
            d1=0.033*Breadth_Draft_ratio - 1.419;
        }
        
            //1 <= B/T <= 3//
        else {
            a1=-3.94*Breadth_Draft_ratio + 13.69;
            b1=-2.12*Breadth_Draft_ratio - 1.89;
            d1=1.16*Breadth_Draft_ratio-7.97;
        }
        
        // console.log(B_0/Draft,B_1/Draft)
        //console.log(a0,a1)
        //B_44 - hydro damping coeff//
        b_44_0 = (1025*A_0*B_0*B_0*a0*Math.exp(b0*Math.pow(encounter_frequency,-1.3))*Math.pow(encounter_frequency,d0)/(Math.sqrt(B_0/(2*g))));
        b_44_1 = (1025*A_1*B_1*B_1*a1*Math.exp(b1*Math.pow(encounter_frequency,-1.3))*Math.pow(encounter_frequency,d1)/(Math.sqrt(B_1/(2*g))));
        
        damping_ratio=Math.sqrt(b_44_1/b_44_0);
        
        b_44 = Length*b_44_0*(delta + b_44_1*(1-delta)/b_44_0);
        //total damping = hydro damping + additional damping//
        
        add_damping = restoring_moment_coeff*natural_period/Math.PI;
        
        roll_hydro_damping= b_44 + add_damping*critical_damping_percentage;
        
        //excitation frequency//
        if (heading == 90  || heading ==270){
        excitation_frequency=Math.sqrt(1025*g*g*b_44_0/encounter_frequency)*(delta+damping_ratio*(1-delta))*Length
        
        }
        else{  
        A=Math.abs(Math.sin(betha))*Math.sqrt(1025*g*g/encounter_frequency)*Math.sqrt(b_44_0)*2/eff_wave_number;
        B=Math.pow(Math.sin(0.5*delta*Length*eff_wave_number),2);
        C=Math.pow(damping_ratio*Math.sin(0.5*(1-delta)*Length*eff_wave_number),2);
        D=2*damping_ratio*Math.sin(0.5*delta*Length*eff_wave_number)*Math.sin(0.5*(1-delta)*Length*eff_wave_number)*Math.cos(0.5*Length*eff_wave_number);
        
        excitation_frequency=A*Math.sqrt(B+C+D)
        }
        
    //  excitation_frequency=Math.sqrt(1025*g*g*b_44_0/encounter_frequency)*(delta+damping_ratio*(1-delta))*Length; 
        //main formula//
                    
        A = Math.pow(-Math.pow(encounter_frequency*natural_period/(2*3.14159),2)+1,2);
        B = Math.pow(restoring_moment_coeff,2); 
        C = Math.pow(encounter_frequency*roll_hydro_damping,2); 
        

        Roll_Movement[i] = Wave_Amplitude*excitation_frequency/(Math.sqrt(A*B+C));
        //Roll_Movement[i] = Wave_Amplitude*excitation_frequency
        // Roll_Movement[i] = Wave_Amplitude*excitation_frequency/(Math.sqrt(A*B+C));
        
    }

    //This "for()" receives the results from the motion vectors and prepare the graphics//

    for (i = 0; i <= 1000; i++) 
    {
    Results_array1.push([wave_freq[i],Vertical_Movement[i]]);
    Results_array2.push([wave_freq[i],Vertical_Acceleration[i]]);
    Results_array3.push([wave_freq[i],Pitch_Movement[i]]);
    Results_array4.push([wave_freq[i],Heave_Movement[i]]);
    Results_array5.push([wave_freq[i],Bending_Moment[i]]);
    Results_array6.push(Roll_Movement[i]*180/Math.PI);
    Results_array7.push([wave_period[i],Roll_Movement[i]*180/Math.PI]);
        
    }



    /*
    $.plot("#graphic1",[{label: "Vertical Movement (m/m) x &#969; (rad/s)",     data: Results_array1 }],{series:{lines:{show:true}},yaxis:{ticks:10,tickDecimals:3},grid:{backgroundColor:{colors:["#fff","#eee"]},borderWidth:{top: 1,right: 1,bottom: 2,left: 2}}});
    $.plot("#graphic2",[{label: "Vertical Acceleration (m/s<SUP>2</SUP>) x &#969; (rad/s)", data: Results_array2 }],{series:{lines:{show:true}},yaxis:{ticks:10,tickDecimals:3},grid:{backgroundColor:{colors:["#fff","#eee"]},borderWidth:{top: 1,right: 1,bottom: 2,left: 2}}});
    $.plot("#graphic3",[{label: "Pitch motion/k (m/m) x &#969; (rad/s)",        data: Results_array3 }],{series:{lines:{show:true}},yaxis:{ticks:10,tickDecimals:3},grid:{backgroundColor:{colors:["#fff","#eee"]},borderWidth:{top: 1,right: 1,bottom: 2,left: 2}}});
    $.plot("#graphic4",[{label: "Heave motion (m/m) x &#969; (rad/s)",        data: Results_array4 }],{series:{lines:{show:true}},yaxis:{ticks:10,tickDecimals:3},grid:{backgroundColor:{colors:["#fff","#eee"]},borderWidth:{top: 1,right: 1,bottom: 2,left: 2}}});
    $.plot("#graphic5",[{label: "Bending Moment (N.m 10e6) x &#969; (rad/s)",        data: Results_array5 }],{series:{lines:{show:true}},yaxis:{ticks:10,tickDecimals:3},grid:{backgroundColor:{colors:["#fff","#eee"]},borderWidth:{top: 1,right: 1,bottom: 2,left: 2}}});
    $.plot("#graphic6",[{label: "Vertical Movement (m/m) x &#969; (rad/s)",     data: Results_array1 }],{series:{lines:{show:true}},yaxis:{ticks:10,tickDecimals:3},grid:{backgroundColor:{colors:["#fff","#eee"]},borderWidth:{top: 1,right: 1,bottom: 2,left: 2}}});
    $.plot("#graphic7",[{label: "Vertical Acceleration (m/s<SUP>2</SUP>) x &#969; (rad/s)", data: Results_array2 }],{series:{lines:{show:true}},yaxis:{ticks:10,tickDecimals:3},grid:{backgroundColor:{colors:["#fff","#eee"]},borderWidth:{top: 1,right: 1,bottom: 2,left: 2}}});
    $.plot("#graphic8",[{label: "Pitch motion/k (m/m) x &#969; (rad/s)",        data: Results_array3 }],{series:{lines:{show:true}},yaxis:{ticks:10,tickDecimals:3},grid:{backgroundColor:{colors:["#fff","#eee"]},borderWidth:{top: 1,right: 1,bottom: 2,left: 2}}});
    $.plot("#graphic9",[{label: "Heave motion (m/m) x &#969; (rad/s)",        data: Results_array4 }],{series:{lines:{show:true}},yaxis:{ticks:10,tickDecimals:3},grid:{backgroundColor:{colors:["#fff","#eee"]},borderWidth:{top: 1,right: 1,bottom: 2,left: 2}}});
    $.plot("#graphic10",[{label: "Bending Moment (N.m x 10e6) x &#969; (rad/s)",        data: Results_array5 }],{series:{lines:{show:true}},yaxis:{ticks:10,tickDecimals:3},grid:{backgroundColor:{colors:["#fff","#eee"]},borderWidth:{top: 1,right: 1,bottom: 2,left: 2}}});
    $.plot("#graphic11",[{label: "Roll (degrees) x &#969; (rad/s)",        data: Results_array6 }],{series:{lines:{show:true}},yaxis:{ticks:10,min:0.5,tickDecimals:2},xaxis:{ticks:5,max:2},grid:{backgroundColor:{colors:["#fff","#eee"]},borderWidth:{top: 1,right: 1,bottom: 2,left: 2}}});
    $.plot("#graphic12",[{label: "Roll (degrees) x T; (s)",        data: Results_array7 }],{series:{lines:{show:true}},yaxis:{ticks:10,min:0.5,tickDecimals:2},xaxis:{ticks:15,max:30},grid:{backgroundColor:{colors:["#fff","#eee"]},borderWidth:{top: 1,right: 1,bottom: 2,left: 2}}});
    */

    plot_seakeeping = document.getElementById("plot_seakeeping").value;

    var xAxisValue = wave_freq;
    var yAxisValue;
    var yTitle;

    if (plot_seakeeping == "1") {
        yAxisValue = Vertical_Movement;
        yTitle = "Vertical Movement [m/m]";
    } else if (plot_seakeeping == "2") {
        yAxisValue = Vertical_Acceleration;
        yTitle = "Vertical Acceleration [m/s<SUP>2</SUP>]";
    } else if (plot_seakeeping == "3") {
        yAxisValue = Results_array6;
        yTitle = "Roll [<SUP>o</SUP>]";
    }

    var trace = {
        x: xAxisValue,
        y: yAxisValue,
        line: {shape: 'spline'},
        type: 'scatter',
        name: 'Form Resistance'
    };


    var data = [trace];
    
    var layout = {
        xaxis: {
            title: "Wave Frequency [rad/s]"
        },
        yaxis: {
            title: yTitle
        },
        legend: {
            x: 0,
            y: 1
        },
        margin: {
            r: 20,
            t: 0,
            b: 50,
            l: 50
        },
    };
    
    Plotly.newPlot('jensenSeakeeping', data, layout);

}