#!/usr/bin/env python3

import argparse
import shutil
import zipfile
from pathlib import Path
from zipfile import ZipFile

import call_wrapper

def path_basename_tuple(path):
    return (path, path.name)

def zipdir(zip_file, path, arc_path=None):
    assert(path.exists() and path.is_dir())

    for file in path.rglob('*'):
        if (file.name.startswith('.')):
            # skip `hidden` files
            continue
        if (arc_path):
            file_arc_path = f'{arc_path}/{file.relative_to(path)}'
        else:
            file_arc_path = file.relative_to(path)
        zip_file.write(file, file_arc_path)

def pack():
    cur_dir = Path(__file__).parent.absolute()
    root_dir = cur_dir.parent
    
    output_dir = root_dir/'_result'
    output_dir.mkdir(parents=True, exist_ok=True)
    
    output_zip = output_dir/'catrox_qwr_edition.zip'
    output_zip.unlink(missing_ok=True)
    
    output_packages_dir = output_dir/'packages'
    if output_packages_dir.exists():
        shutil.rmtree(output_packages_dir)
    output_packages_dir.mkdir(parents=True)
    
    for d in (root_dir/'packages').glob('*'):
        for f in d.glob('*'):
            package_zip = output_packages_dir/f'{f.name}.zip'
            with ZipFile(package_zip, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
                zipdir(z, f)   
            print(f'Generated package: {package_zip}')
            
            # there should be only one package per dir anyway
            break

    with ZipFile(output_zip, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        zipdir(z, output_packages_dir, 'packages')
        zipdir(z, root_dir/'fonts', 'fonts')
        z.write(root_dir/'layout'/'theme.fcl', 'layout/theme.fcl')

    print(f'Generated file: {output_zip}')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Pack')

    call_wrapper.final_call_decorator(
        'Packing',
        'Packing: success',
        'Packing: failure!'
    )(
    pack
    )(
    )
