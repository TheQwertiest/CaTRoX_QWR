#!/usr/bin/env python3

import argparse
import json
import os
import semver
import subprocess
import shutil
import tempfile
import time
from pathlib import Path
from typing import Union

import call_wrapper
import update_changelog

PathLike = Union[str, Path]

def get_cwd_repo_root():
    repo_dir = Path(os.getcwd()).absolute()
    cmd_get_root = [
        'git',
        '-C',
        str(repo_dir),
        'rev-parse',
        '--show-toplevel'
    ]

    root = subprocess.check_output(cmd_get_root, text=True, env=os.environ, cwd=repo_dir).strip()
    return Path(root)

def git_add_new_changelog(repo_dir: PathLike,
                          release_version):
    changelog = update_changelog.update(root_dir=repo_dir, new_version=release_version, silent=True)
    cmd_git_add = [
        'git',
        'add',
        'CHANGELOG.md'
    ]
    print('> ' + ' '.join(cmd_git_add))
    subprocess.check_call(cmd_git_add, env=os.environ, cwd=repo_dir)

    return changelog

def git_commit_and_push_new_files(repo_dir: PathLike,
                                  release_version):
    cmd_git_commit = [
        'git',
        'commit',
        '-m', f'v{release_version}'
    ]
    print('> ' + ' '.join(cmd_git_commit))
    subprocess.check_call(cmd_git_commit, env=os.environ, cwd=repo_dir)

    cmd_git_push = [
        'git',
        'push'
    ]
    print('> ' + ' '.join(cmd_git_push))
    subprocess.check_call(cmd_git_push, env=os.environ, cwd=repo_dir)

def git_publish_release(repo_dir: PathLike,
                        release_version,
                        changelog,
                        release_assets):
    changelog = '# Changelog\n\n' + changelog

    temp_dir = ''
    try:
        temp_dir = tempfile.mkdtemp()
        temp_file = Path(temp_dir)/'changelog.md'
        with open(temp_file, 'w') as output:
            output.write(changelog)
        cmd_create_release = [
            'gh',
            'release',
            'create',
            f'v{str(release_version)}',
            '--draft',
            '--notes-file', str(temp_file.absolute()),
            ] + release_assets

        print('> ' + ' '.join(cmd_create_release))
        subprocess.check_call(cmd_create_release, env=os.environ, cwd=repo_dir)
    finally:
        if temp_dir:
            shutil.rmtree(temp_dir)
            
def publish(repo_dir: PathLike,
            release_version,
            release_assets):
    if not repo_dir:
        repo_dir = get_cwd_repo_root()
    if not release_version:
        raise ValueError('`release_version` is empty')
    parsed_ver = semver.VersionInfo.parse(release_version)

    changelog = git_add_new_changelog(repo_dir, release_version)
    git_commit_and_push_new_files(repo_dir, release_version)
    git_publish_release(repo_dir, release_version, changelog, release_assets)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Publish GitHub release')
    parser.add_argument('--repo_dir', default=get_cwd_repo_root())
    parser.add_argument('--release_assets', default=[], nargs='+')
    parser.add_argument('release_version', type=str, help='release version')

    args = parser.parse_args()

    call_wrapper.final_call_decorator(
        "Publishing",
        "Published successfully!",
        "Publishing failed!"
    )(
    publish
    )(
        repo_dir=args.repo_dir,
        release_version=args.release_version,
        release_assets=args.release_assets
    )

