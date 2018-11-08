#!/bin/bash
. ${BASH_SOURCE%/*}/load_environment_light.sh

export RAMDISK=$HOME/tmp/ramdisk
if [ ! -d $RAMDISK ]; then
        mkdir -p $RAMDISK
fi
if mountpoint -q "$RAMDISK" ; then
  echo "RAMDISK $RAMDISK is already mounted"
else
   sudo mount -t tmpfs -o size=4g new_ram_disk $RAMDISK
fi
for prj in "${OF_COMPONENTS[@]}"; do
  hash="$(echo -n "$prj" | md5sum | sed 's/ .*$//')"
  if [ ! -d $RAMDISK/$hash ]; then
    mkdir $RAMDISK/$hash
  fi
  if [ ! -L $prj/build ]; then
    if [ -d $prj/build ]; then
      rm -R $prj/build
    fi
    echo "creating symbolic link $prj/build -> $RAMDISK/$hash"
    ln -s $RAMDISK/$hash $prj/build
  fi
done
export TMP=$RAMDISK
