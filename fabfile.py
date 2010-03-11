from fabric.api import run, local, env
from fabric.contrib.project import rsync_project

env.user = 'jbalogh'
env.hosts = ['jbalogh.me']

def up():
    local('rm -rf _site')
    local('jekyll')
    rsync_project('w', '_site/', exclude='projects', delete=True)
