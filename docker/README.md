# Docker image for the Maritime Cloud Portal Demo
To build the image

  $ docker build -t mcportaldemo .

To create and run the container

  $ docker run --name mcportaldemo mcportaldemo

If Docker for some reason doesn't forward the default network to localhost run this instead

  $ docker run --net=host --name mcportaldemo mcportaldemo
