#!/usr/bin/env python3

import argparse
import re
import os
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Union

import call_wrapper

PathLike = Union[str, Path]

def get_current_repo(root_dir: PathLike):
    cmd_git_get_remote = [
        'git',
        'config' ,
        '--get',
        'remote.origin.url'
    ]
    print('> ' + ' '.join(cmd_git_get_remote))
    url = subprocess.check_output(cmd_git_get_remote, text=True, env=os.environ, cwd=root_dir)
    return url.replace('.git', '').strip()

def update(root_dir: PathLike,
           new_version: str,
           silent: bool = False):

    cur_dir = Path(__file__).parent.absolute()
    if not root_dir:
        root_dir = cur_dir.parent

    date = datetime.today().strftime('%Y-%m-%d')
    changelog_path = root_dir/'CHANGELOG.md'
    repo = get_current_repo(root_dir)

    with Path(changelog_path).open('r') as f:
        changelog = f.read()

    # Find current changelog
    it = re.search(
        r'^## \[Unreleased\]\[\]$'
        r'((?s:.*?))'
        r'^## \[.*?\]\[\] - .*?$',
        changelog,
        re.MULTILINE
    )
    current_changelog = it.group(1).strip()

    # Update table of contents
    it = re.search(r'^\- \[Unreleased\]\(#unreleased\)$', changelog, re.MULTILINE)
    changelog = (
        changelog[:it.end()] +
        '\n'
        f'- [{new_version}](#{new_version.replace(".","")}---{date})' +
        changelog[it.end():]
    )

    # Replace `unreleased` header with a new one
    it = re.search(r'^## \[Unreleased\]\[\]$', changelog, re.MULTILINE)
    changelog = (
        changelog[:it.end()] +
        '\n'
        '\n'
        f'## [{new_version}][] - {date}' +
        changelog[it.end():]
    )

    # Add a link to the new diff
    it = re.search(r'^\[unreleased\]: ' + repo.replace('.', '\.') + r'/compare/v(.*)\.\.\.HEAD$', changelog, re.MULTILINE)
    old_version = it.group(1)
    unreleased_link = it.group(0).replace(old_version,new_version)

    changelog = (
        changelog[:it.start()] +
        unreleased_link +
        '\n' +
        f'[{new_version}]: {repo}/compare/v{old_version}...v{new_version}' +
        changelog[it.end():]
    )

    with Path(changelog_path).open('w') as f:
        f.write(changelog)

    if not silent:
        print(f"Updated changelog: {changelog_path}")
    return current_changelog

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Update changelog with new version')
    parser.add_argument('--root_dir', default=Path(os.getcwd()).absolute())
    parser.add_argument('release_version', type=str, help='release version')

    args = parser.parse_args()

    call_wrapper.final_call_decorator(
        "Updating changelog",
        "Updating changelog: success!",
        "Updating changelog: failed!"
    )(
    update
    )(
        args.root_dir,
        args.release_version
    )

