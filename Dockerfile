FROM node:14.15

USER root

RUN  apt-get update -y
RUN  apt-get install xvfb -y

RUN apt-get install fonts-liberation \
libappindicator3-1 \
libasound2 \
libatk-bridge2.0-0 \
libatk1.0-0 \
libc6 \
libcairo2 \
libcups2 \
libdbus-1-3 \
libexpat1 \
libfontconfig1 \
libgbm1 \
libgcc1 \
libglib2.0-0 \
libgtk-3-0 \
libnspr4 \
libnss3 \
libpango-1.0-0 \
libpangocairo-1.0-0 \
libstdc++6 \
libx11-6 \
libx11-xcb1 \
libxcb1 \
libxcomposite1 \
libxcursor1 \
libxdamage1 \
libxext6 \
libxfixes3 \
libxi6 \
libxrandr2 \
libxrender1 \
libxss1 \
libxtst6 \
lsb-release \
wget \
xdg-utils \
-y


WORKDIR /pup

ADD package.json package-lock.json ./
RUN npm install
COPY . .

ENV DISPLAY :99
ENV TZ "America/Los_Angeles"

RUN chmod +x ./run_test.sh

CMD ["/pup/run_test.sh"]
#ENTRYPOINT ["/pup/run_test.sh"]
