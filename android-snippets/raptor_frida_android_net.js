/*
 * raptor_frida_android_*.js - Frida snippets for Android
 * Copyright (c) 2017 Marco Ivaldi <raptor@0xdeadbeef.info>
 *
 * Frida.re JS script snippets for Android instrumentation.
 * See https://www.frida.re/ and https://codeshare.frida.re/
 * for further information on this powerful tool.
 *
 * "We want to help others achieve interop through reverse
 * engineering" -- @oleavr
 *
 * Many thanks to Maurizio Agazzini <inode@wayreth.eu.org>
 * and Federico Dotta <federico.dotta@mediaservice.net>.
 *
 * Example usage:
 * # frida -U -f com.xxx.yyy -l raptor_frida_android.js --no-pause
 */

setTimeout(function() { // avoid java.lang.ClassNotFoundException
    function process(buf_arg, len_arg, title) {
        const len = len_arg.toInt32();
        if(len > 0) {
            const str = buf_arg.readCString(len);
            console.log(title + str);
        }
    }

    const sendto_f = Module.getExportByName('libc.so', 'sendto');
    Interceptor.attach(sendto_f, {
        onEnter(args) {
            //console.log('sendto called from:' + Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join('｜'));
            process(args[1], args[2], "sendto:\n");
        }
    });

    const send_f = Module.getExportByName('libc.so', 'send');
    Interceptor.attach(send_f, {
        onEnter(args) {
            process(args[1], args[2], "send:\n");
        }
    });

    // const recv_f = Module.getExportByName('libc.so', 'recv');
    // Interceptor.attach(recv_f, {
    //     onEnter(args) {
    //         process(args[1], args[2], 'recv:\n');
    //     }
    // });

    // const recvfrom_f = Module.getExportByName('libc.so', 'recvfrom');
    // Interceptor.attach(recvfrom_f, {
    //     onEnter(args) {
    //         process(args[1], args[2], 'recvfrom:\n');
    //     }
    // });
}, 0);
