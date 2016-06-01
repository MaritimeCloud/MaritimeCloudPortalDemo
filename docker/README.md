# Docker image for the Maritime Cloud Portal Demo
If you want to build the image yourself do

  $ docker build -t mcportaldemo .

To create and run the container

  $ docker run --name mcportaldemo mcportaldemo

If Docker for some reason doesn't forward the default network to localhost run this instead

  $ docker run --net=host --name mcportaldemo mcportaldemo

Else if you just want to use the latest image from Docker hub, which we recommend, do

  $ docker run --name mcportaldemo dmadk/maritimecloud-portal-demo

Or

  $ docker run --net=host --name mcportaldemo dmadk/maritimecloud-portal-demo
