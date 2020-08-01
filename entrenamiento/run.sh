#!/bin/bash


python train.py --data_path=../datos/poblaciones.txt \
--rnn_size 256 \
--num_layers 2 \
--seq_length 64 \
--batch_size 32 \
--num_epochs 20 \
--output_keep_prob 0.75 \
--model lstm \
--save_checkpoints ./checkpoints \
--save_model ./models \
--print_every 10

#--model: rnn, gru, lstm, nas


rm -r ../generacion/models/poblaciones
cp -r ./models/poblaciones ../generacion/models/poblaciones