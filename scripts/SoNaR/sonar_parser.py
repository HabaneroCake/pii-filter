#!/usr/local/bin/python3

"""
Test for parsing the SoNaR dataset
"""

import os
import re
import xml.etree.ElementTree as ET

def get_paths_with_extension(origin_path, extension, recursive=False):
    """ returns the paths of all the files with the specified extension in the specified location """
    for file_name in os.listdir(origin_path):
        path = os.path.abspath(os.path.join(origin_path, file_name))
        if os.path.isfile(path) and path.endswith(extension):
            yield path
        elif recursive and os.path.isdir(path):
            yield from get_paths_with_extension(path, extension, recursive)

def get_FoLiA_sms():
    # FOLIA SMS
    result = []

    FoLiA_sms_folder = # add folder path here
    FoLiA_sms_paths = get_paths_with_extension(FoLiA_sms_folder, '.xml')


    for file_path in FoLiA_sms_paths:
        try:
            with open(file_path, encoding="utf-8", errors='ignore') as f:
                root = ET.fromstring(re.sub(r'&', '&amp;', f.read()))
                for row in root[1]:
                    if len(row) > 1 and len(row[1]) > 3:
                        s = []
                        for w_root in row[1]:
                            txt =   w_root[0].text
                            cl =    w_root[1].get('class')
                            
                            if 'SPEC(symb)' in cl or 'LET()' in cl:
                                continue

                            s.append({'t':txt, 'c':cl})
                            print(txt, cl)

                        result.append(s)
                        print('\n')
        except:
            print('invalid file', file_path)
            continue
    return result

get_FoLiA_sms()