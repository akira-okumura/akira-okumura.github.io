function author_list(useShortNames, journal, category) {
    /* Change these three options yourself */
    /* useShortNames --- true: A.~Okumura , false: Akira~Okumura */
    /* journal --------- POS: Proceedings of Science (e.g., ICRC2015)
                         HTML: HTML output for Word users
                         AIP: American Institute of Physics
                         APP: Astroparticle Physics (not supported yet)
                         APJ: Astrophysical Journal (not supported yet) */
    /* category -------  GCT, Science, Camera, Optics, TCS, or MC */

    tables = document.getElementsByTagName("table");
    author_table = tables[0].getElementsByTagName("tr");
    affiliation_table = tables[1].getElementsByTagName("tr");

    author2affiliation = {};
    shortaff2longaff_address = {};
    affiliation_indices = [];
    for (i = 1; i < author_table.length; i++) {
        tds = author_table[i].getElementsByTagName("td");
        fullname     = tds[0].innerHTML;
        shortname    = tds[1].innerHTML;
        affiliations = tds[2].innerHTML;
        status       = tds[3].innerHTML;
        science      = tds[4].innerHTML;
        camera       = tds[5].innerHTML;
        optics       = tds[6].innerHTML;
        tcs          = tds[7].innerHTML;
        mc           = tds[8].innerHTML;

        /* GEPI and LUTH members use the single address */
        affiliations = affiliations.replace("GEPI", "Paris");
        affiliations = affiliations.replace("LUTH", "Paris");

        /* There are some person who don't provides their short names */
        if (shortname == "") {
            sp = fullname.split(", ");
            shortname = sp[0] + ", " + sp[1][0] + ".";
        }

        if (category == "Science" && science == "") continue;
        if (category == "Camera"  && camera  == "") continue;
        if (category == "Optics"  && optics  == "") continue;
        if (category == "TCS"     && tcs     == "") continue;
        if (category == "MC"      && mc      == "") continue;

        if (useShortNames) {
            author2affiliation[shortname] = affiliations;
        } else {
            author2affiliation[fullname] = affiliations;
        }
    }

    for (i = 1; i < affiliation_table.length; i++) {
        tds = affiliation_table[i].getElementsByTagName("td");
        shortname   = tds[0].innerHTML;
        affiliation = tds[1].innerHTML;
        address     = tds[2].innerHTML;
        shortaff2longaff_address[shortname] = [affiliation, address];
    }

    sorted_author_keys = [];

    for(key in author2affiliation) {
        sorted_author_keys.push(key);
    }
    sorted_author_keys.sort();

    output = "";

    if(journal == "POS"){
        output += "\\author{";
    } else if(journal == "AIP"){
        output += "";
    } else if(journal == "HTML"){
        output += "";
    }

    for(i = 0; i < sorted_author_keys.length; i++){
        name = sorted_author_keys[i];

        affs = author2affiliation[name].split(";");

        for(j = 0; j < affs.length; j++){
            if(affiliation_indices.indexOf(affs[j]) < 0){
                affiliation_indices.push(affs[j]);
            }
        }

        last = name.split(", ")[0];
        first = name.split(", ")[1];
        if (journal == "AIP") {
            output += "\\author[";
            for(j = 0; j < affs.length; j++){
                idx = affiliation_indices.indexOf(affs[j]);
                output += "aff" + (idx + 1) + ",";
            }
            if(output[output.length - 1] == ","){
                /* drop an unnecessary "," */
                output = output.slice(0, -1);
            }
            output += "]{" + first + "~" + last + "}\n";
        } else {
            if (i != sorted_author_keys.length - 1){
                if(journal == "HTML"){
                    output += first + String.fromCharCode(160) + last;
                } else {
                    output += first + "~" + last;
                }
            } else {
                if(journal == "HTML"){
                    output += "and " + first + " " + last;
                } else {
                    output += "and " + first + "~" + last;
                }
            }
        }

        if(journal == "POS"){
            output += "$^{";
        } else if(journal == "AIP"){
            // do nothing
        } else if(journal == "HTML"){
            output += "<sup><i>";
        }

        for(j = 0; j < affs.length; j++){
            idx = affiliation_indices.indexOf(affs[j]);
            if(journal != "AIP"){
                output += String.fromCharCode(97 + idx) + ",";
            }
        }
        if(output[output.length - 1] == ","){
            /* drop an unnecessary "," */
            output = output.slice(0, -1);
        }
        if (i != sorted_author_keys.length - 1){
            if(journal == "POS"){
                output += "}$, ";
            } else if(journal == "AIP"){
                // do nothing
            } else if(journal == "HTML"){
                output += "</i></sup>, ";
            }
        } else {
            if(journal == "POS"){
                output += "}$";
            } else if(journal == "AIP"){
                // do nothing
            } else if(journal == "HTML"){
                output += "</i></sup>";
            }
        }
    }

    if(journal == "POS"){
        output += "\\\\\n";
    } else if(journal == "AIP"){
        // do nothing
    } else if(journal == "HTML"){
        output += "<br>";
    }

    for(i = 0; i < affiliation_indices.length; i++){
        affiliation = affiliation_indices[i];
        if(journal == "POS"){
            output += "\\llap{$^" + String.fromCharCode(97 + i) + "$}";
            output += shortaff2longaff_address[affiliation][0] + ", ";
            output += shortaff2longaff_address[affiliation][1] + "\\\\\n";
        } else if(journal == "AIP"){
            output += "\\affil[aff" + (i + 1) + "]{";
            output += shortaff2longaff_address[affiliation][0] + ", ";
            output += shortaff2longaff_address[affiliation][1] + "}\n";
        } else if(journal == "HTML"){
            output += "<sup><i>" + String.fromCharCode(97 + i) + "</i></sup>";
            output += shortaff2longaff_address[affiliation][0] + ", ";
            output += shortaff2longaff_address[affiliation][1] + "<br>";
        }
    }

    if(journal == "POS"){
        output += "}\n";
    } else if(journal == "AIP"){
        // do nothing
    } else if(journal == "HTML"){
        output += "<br>";
    }

    if(journal == "HTML"){
        return "<p>" + output + "</p>";
    } else {
        output = output.split("ﾃｼ").join("\\\"{u}");
        output = output.split("ﾃｩ").join("\\'{e}");
        output = output.split("ﾃｨ").join("\\`{e}");
        return "<pre>" + output + "</pre>";
    }
}
