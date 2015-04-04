#HW 4 

##Prerequisites

You'll need the following:

- Redis - You can get it [here](http://redis.io/), you'll want it installed globally.  If you are on OSX and have homebrew installed the easiest way is the following command:

`brew install redis`

- npm/nodejs - You can get it [here](https://nodejs.org/download/).  Again, with homebrew:

`brew install node`

##Usage

This setup was designed to be completely self contained.  Everything is glued together with one main bash script called `install.sh`.  Basic function when `install.sh` runs is as follows:

- It generates this folder structure:

- root
  - App
  - deploy
    - blue.git
    - green.git
    - blue-www
    - green-www

- It downloads a server setup into App and sets up blue.git and green.git as git repos.
- It generates a post-recieve hook based on where the repo is downloaded to in both blue.git and green.git.
- It runs npm install in the App folder and in the root folder
- It generates two git remotes in the App folder:
  - blue 
  - green
- It runs `git add -A` in App
- Finally it runs `git commit -m "first commit" in App

At this point the entire structure is completely set up.  A screenshot of the command line output is shown below:

![install.sh]()

Going to the App folder and running:

`git push green master`

Pushes to green-www and runs a command to run redis-server on port 6379.

A screenshot is below:

![greenpush]()

`git push blue master`

Pushes to blue-www and runs a command to run redis-server on port 6380.

A screenshot is below:

![bluepush]()

Running 

`node infrastructure.js` 

brings up the infrastructure proxy setup.

A screenshot is below:

![infrastructure]()

You'll see when running that going [here](http://localhost:8080) brings up the fullscreen setup shown below:

![firstcommand]()

Running without mirroring setup is as simple as setting mirrorFlag boolean on line 21 of infrastructure.js to false.

Going to the switch route [here](http://localhost:8080/switch) results in a switch between the two deployed windows, as shown below:

![switch]()

The migration effect can be displayed by running the following set of commands:


`cd App`
`curl -F "image=@./img/morning.jpg" localhost:8080/upload`

Then visit the switch route [here](http://localhost:8080/switch) as shown below:

![switchmigrate1]()

Then visit the meow route [here](http://localhost:8080/meow) with screenshot below:

![switchmigrate2]()

This is accomplished without destroying the data on the original node.  Put another way: on another switch back to the original node the cat picture will still be in that node's redis instance, as shown in the screenshot below:

![switchmigrate3]()

The final big of functionality here is actual mirroring between the two nodes on uploading.  Again switching back the mirrorFlag boolean on line 21 of infrastructure.js to true the following behavior can be seen:

- First run the same uploading commands as before:

`cd App`
`curl -F "image=@./img/morning.jpg" localhost:8080/upload`

Then if we visit the meow route [here](http://localhost:8080/meow) with screenshot below:

![mirror1]()

I'll note that at this point the cat picture has been popped out of the redis instance for port 9090 and will not be migrated by the earlier behavior.  You can see that below:

![emptyredis]()

Now upon visiting the switch route [here](http://localhost:8080/switch), and visiting the meow route [here](http://localhost:8080/meow), you can see in the image below that the cat picture was actually successfully mirrored to the other redis instance:

![mirror2]()

The actual port switching is shown in the console window in the middle of the screenshot.
